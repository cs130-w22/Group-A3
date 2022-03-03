/**
 * Abstracted wrappers for common backend functionality.
 *
 * All functionality described in this module will fire a
 * `Promise<T>` type.
 */

const BACKEND_URL = "http://localhost:8080";

/**
 * Upload a submission for an assignment to the backend for
 * grading. This endpoint is a special case, since it uses FormData instead
 * of a standard JSON body.
 *
 * @param token Authorization token as returned by a login or user creation.
 * @param assignmentId Assignment ID to submit to.
 * @param formData FormData with required fields: `file`.
 * @param onSuccess Fired on a successful request. `liveID` is the ID returned
 *                  for monitoring live submission results.
 * @param onFailure Fired when the request fails.
 */
export function uploadSubmission(
  token: string,
  classId: string,
  assignmentId: string,
  formData: FormData,
  onSuccess: (liveID: string) => void,
  onFailure: (message: string) => void
) {
  fetch(`${BACKEND_URL}/class/${classId}/${assignmentId}/upload`, {
    method: "POST",
    mode: "cors",
    headers: {
      Authorization: token,
    },
    body: formData,
  })
    .then((r) => {
      if (r.status !== 201) throw new Error(`Failed to upload: ${r.status}`);
      return r.text();
    })
    .then(onSuccess)
    .catch(onFailure);
}

export type AuthorizedEndpoint<P, R> = (
  token: string,
  params: P,
  onSuccess: (result: R) => void,
  onFailure: (error: Error) => void
) => void;
export type UnauthorizedEndpoint<P, R> = (
  params: P,
  onSuccess: (result: R) => void,
  onFailure: (error: Error) => void
) => void;

// TODO: make uriGenerator parition parameters into URI values and the corresponding body.
function authorized<T, R>(
  uriGenerator: (params: T) => [string, unknown],
  statusOk = 200,
  expectJSON = true,
  method: "post" | "get" = "post"
): AuthorizedEndpoint<T, R> {
  return (
    token: string,
    params: T,
    onSuccess: (result: R) => void,
    onFailure: (error: Error) => void
  ) => {
    const [uri, body] = uriGenerator(params);

    fetch(`${BACKEND_URL}${uri}`, {
      method,
      mode: "cors",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((r) => {
        if (r.status !== statusOk) throw new Error(r.statusText);
        if (expectJSON) return r.json();
      })
      .then(onSuccess)
      .catch(onFailure);
  };
}

function unauthorized<T, R>(
  uriGenerator: (params: T) => [string, unknown],
  statusOk = 200,
  expectJSON = true,
  method: "post" | "get" = "post"
): UnauthorizedEndpoint<T, R> {
  return (
    params: T,
    onSuccess: (result: R) => void,
    onFailure: (error: Error) => void
  ) => {
    const [uri, body] = uriGenerator(params);

    fetch(`${BACKEND_URL}${uri}`, {
      method,
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((r) => {
        if (r.status !== statusOk) throw new Error(r.statusText);
        if (expectJSON) return r.json();
      })
      .then(onSuccess)
      .catch(onFailure);
  };
}

export interface AssignmentData {
  name: string;
  dueDate: Date;
  points: number;
  submissions: Array<{
    id: string;
    date: Date;
    pointsEarned: number;
  }>;
}

/**
 * Get information about an assignment. For students, this means submission statistics.
 *
 * @param token Authorization token.
 * @param classId ID of the class to fetch from.
 * @param assignmentId Assignment ID to get data from.
 * @param onSuccess Fired on success.
 * @param onFailure Fired on failure.
 */
export const getAssignment = authorized<
  { classId: string; assignmentId: string },
  AssignmentData
>(
  ({ classId, assignmentId }) => [`/${classId}/${assignmentId}`, {}],
  200,
  true,
  "get"
);

export interface ClassData {
  name: string;
  assignments: Array<{
    id: number;
    name: string;
    dueDate: Date;
    points: number;
  }>;
  members: Array<{
    id: number;
    username: string;
  }>;
}

/**
 * Get information about a class.
 *
 * @param token Authorization token.
 * @param classId ID of the class to fetch from.
 * @param onSuccess Fired on success.
 * @param onFailure Fired on failure.
 */
export const getClass = authorized<{ classId: string }, ClassData>(
  ({ classId }) => [`/${classId}/info`, {}],
  200,
  true,
  "get"
);

/**
 * Create a new user account, with the provided username, password
 * and account type.
 *
 * @param username Username for the new account.
 * @param password Password for the new account.
 * @param accountType Whether the user is a professor or student.
 * @param onSuccess Fired on a successful return.
 * @param onFailure Fired when the request fails or the response is unfavorable.
 */
export const createUser = unauthorized<
  { username: string; password: string; type: "student" | "professor" },
  { token: string }
>(() => ["/user", {}], 201);

/**
 * Log in as the given user, minting a new JWT for use in future
 * transactions against the backend.
 *
 * @param username Username for the new account
 * @param password Password for the new account
 * @param onSuccess Fired on a successful return.
 * @param onFailure Fired when the request fails or the response is unfavorable.
 */
export const login = unauthorized<
  { username: string; password: string },
  { token: string }
>(() => ["/login", {}]);

export const createClass = authorized<{ name: string }, { id: string }>(
  () => ["/class", {}],
  201
);

export const joinClass = authorized<{ inviteCode: string }, void>(
  () => ["/class/join", {}],
  204
);

/**
 * Create a new invite to the described class. Will fail if the
 * token provided is not for a professor account.
 *
 * @param token JWT returned from `/login` or `/user`.
 * @param classId ID for the class to invite students to.
 * @param validUntil How long the invite is valid for.
 * @param onSuccess Fired on success with the new invite code.
 * @param onFailure Fired on failure with a message.
 */
export const createInvite = authorized<
  { classId: string; validUntil: Date },
  { inviteCode: string }
>(
  ({ classId, validUntil }) => [`/class/${classId}/invite`, { validUntil }],
  201
);

/**
 * Drop a student from a class. Any student can drop themselves from the
 * class, and a professor can drop anyone from a class except themselves.
 *
 * @param token Authorization token as returned by a login or user creation.
 * @param classId Class to drop the student from.
 * @param studentId Student ID to drop.
 * @param onSuccess Fired on successful request.
 * @param onFailure Fired on failed request.
 */
const dropStudent = authorized<{ classId: string; studentId: string }, void>(
  ({ classId, studentId }) => [`/class/${classId}/drop`, { studentId }]
);
