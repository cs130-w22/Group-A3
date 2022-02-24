# grading

Package housing all of our grading script subsystem.

## Test Case Specification

The grading script test case format is HTTP-like. Each test case should be of the format:

```
### 		(Test ID, 000-999)
HIDDEN 	(if hidden)
  	  	(if HIDDEN, then only score is required)
NAME TestName
  	 (if NAME is omitted, then all text until the score is treated as a message)
Message
SCORE 	(Score)
```
