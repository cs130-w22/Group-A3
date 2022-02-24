/**
 * Abstracted wrappers for common backend functionality.
 *
 * All functionality described in this module will fire a
 * `Promise<T>` type.
 */

const BACKEND_URL = "http://localhost:8080/";

/**
 * Log in as the given user, minting a new JWT for use in future
 * transactions against the backend.
 *
 * @param username Username for the new account
 * @param password Password for the new account
 * @param onSuccess Fired on a successful return.
 * @param onFailure Fired when the request fails or the response is unfavorable.
 */
function login(
  username: string,
  password: string,
  onSuccess: (token: string) => void,
  onFailure: (message: string) => void
) {
  fetch(`${BACKEND_URL}/login`, {
    method: "POST",
    mode: "cors",
    body: JSON.stringify({
      username,
      password,
    }),
  })
    .then((response) => response.json())
    .then((json) => onSuccess(json?.token))
    .catch(onFailure);
}

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
function createUser(
  username: string,
  password: string,
  accountType: "student" | "professor",
  onSuccess: (token: string) => void,
  onFailure: (message: string) => void
) {
  fetch(`${BACKEND_URL}/user`, {
    method: "POST",
    mode: "cors",
    body: JSON.stringify({
      username,
      password,
      type: accountType,
    }),
  })
    .then((r) => r.json())
    .then((j) => onSuccess(j?.token))
    .catch(onFailure);
}

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
function createInvite(
  token: string,
  classId: string,
  validUntil: Date,
  onSuccess: (inviteCode: string) => void,
  onFailure: (message: string) => void
) {
  fetch(`${BACKEND_URL}/class/${classId}/invite`, {
    method: "POST",
    mode: "cors",
    headers: {
      Authorization: token,
    },
    body: JSON.stringify({
      validUntil,
    }),
  })
    .then((r) => r.json())
    .then((j) => onSuccess(j?.inviteCode))
    .catch(onFailure);
}

/**
 * Upload a submission for an assignment to the backend for
 * grading.
 *
 * @param token Authorization token as returned by a login or user creation.
 * @param assignmentId Assignment ID to submit to.
 * @param formData FormData with required fields: `file`.
 * @param onSuccess Fired on a successful request. `liveID` is the ID returned
 *                  for monitoring live submission results.
 * @param onFailure Fired when the request fails.
 */
function uploadSubmission(
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

export { login, createUser, createInvite, uploadSubmission };
