import cv2
import mediapipe as mp
import numpy as np
import time

# Initialize MediaPipe Face Mesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=False, max_num_faces=1, refine_landmarks=True)

# Camera Matrix for Head Pose Estimation
FOCAL_LENGTH = 1 * 640  # Approximate focal length
CAMERA_MATRIX = np.array([
    [FOCAL_LENGTH, 0, 320],
    [0, FOCAL_LENGTH, 240],
    [0, 0, 1]
], dtype=np.float32)

# 3D model points for head pose estimation
MODEL_POINTS = np.array([
    (0.0, 0.0, 0.0),     # Nose tip
    (0.0, -330.0, -65.0),  # Chin
    (-225.0, 170.0, -135.0),  # Left eye corner
    (225.0, 170.0, -135.0),  # Right eye corner
    (-150.0, -150.0, -125.0),  # Left mouth corner
    (150.0, -150.0, -125.0)   # Right mouth corner
], dtype=np.float32)

# Define mouth landmark indices
MOUTH_INDICES = [61, 291, 0]  # Left corner, Right corner, Upper midpoint

def is_smiling(mouth, threshold=0.12):
    """Checks if a person is smiling."""
    left_corner, right_corner, upper_mid = mouth
    left_dist = abs(left_corner[1] - upper_mid[1])
    right_dist = abs(right_corner[1] - upper_mid[1])
    mouth_width = np.linalg.norm(left_corner - right_corner)
    ratio = (left_dist + right_dist) / (2 * mouth_width)
    return ratio < threshold  # If ratio is small, it's a smile

def analyze_face(landmarks, width, height):
    """Analyzes eye direction and yawning status."""
    left_eye = [(int(landmarks[33].x * width), int(landmarks[33].y * height)),
                (int(landmarks[133].x * width), int(landmarks[133].y * height))]
    right_eye = [(int(landmarks[362].x * width), int(landmarks[362].y * height)),
                 (int(landmarks[263].x * width), int(landmarks[263].y * height))]
    left_iris = [(int(landmarks[468].x * width), int(landmarks[468].y * height))]
    right_iris = [(int(landmarks[473].x * width), int(landmarks[473].y * height))]

    left_iris_pos = (left_iris[0][0] - left_eye[0][0]) / (left_eye[1][0] - left_eye[0][0])
    right_iris_pos = (right_iris[0][0] - right_eye[0][0]) / (right_eye[1][0] - right_eye[0][0])

    if left_iris_pos < 0.4 and right_iris_pos < 0.4:
        eye_direction = "Looking Right"
    elif left_iris_pos > 0.6 and right_iris_pos > 0.6:
        eye_direction = "Looking Left"
    else:
        eye_direction = "Looking Center"
    
    mouth_open_ratio = landmarks[14].y - landmarks[13].y
    eye_openness = landmarks[145].y - landmarks[159].y

    sleepy_status = "Yawning/Sleepy" if mouth_open_ratio > 0.05 or eye_openness < 0.02 else "Awake"
    
    return eye_direction, sleepy_status

def analyze_head_pose(landmarks, width, height):
    """Estimates head pose using solvePnP."""
    image_points = np.array([
        (landmarks[1].x * width, landmarks[1].y * height),
        (landmarks[199].x * width, landmarks[199].y * height),
        (landmarks[33].x * width, landmarks[33].y * height),
        (landmarks[263].x * width, landmarks[263].y * height),
        (landmarks[61].x * width, landmarks[61].y * height),
        (landmarks[291].x * width, landmarks[291].y * height)
    ], dtype=np.float32)
    
    success, rotation_vector, _ = cv2.solvePnP(MODEL_POINTS, image_points, CAMERA_MATRIX, None)
    
    if success:
        rmat, _ = cv2.Rodrigues(rotation_vector)
        angles, _, _, _, _, _ = cv2.RQDecomp3x3(rmat)
        pitch, yaw, _ = angles

        if yaw > 10:
            head_position = "Looking Right"
        elif yaw < -10:
            head_position = "Looking Left"
        elif pitch > 10:
            head_position = "Looking Up"
        else:
            head_position = "Head Straight"
    else:
        head_position = "Head Position Unknown"
    
    return head_position

# Start video capture
cap = cv2.VideoCapture(0)

cv2.namedWindow("Real-Time Face Analysis", cv2.WND_PROP_FULLSCREEN)
cv2.setWindowProperty("Real-Time Face Analysis", cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_FULLSCREEN)

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    
    frame = cv2.flip(frame, 1)
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb_frame)
    
    if results.multi_face_landmarks:
        for face_landmarks in results.multi_face_landmarks:
            landmarks = np.array([(lm.x * frame.shape[1], lm.y * frame.shape[0]) for lm in face_landmarks.landmark])
            
            # Extract facial analysis
            eye_msg, sleepy_msg = analyze_face(face_landmarks.landmark, frame.shape[1], frame.shape[0])
            head_msg = analyze_head_pose(face_landmarks.landmark, frame.shape[1], frame.shape[0])
            
            # Extract mouth landmarks for smile detection
            mouth = landmarks[MOUTH_INDICES]
            smile_status = "DISTRACTED:Smiling" if is_smiling(mouth) else "NEUTRAL:Not smiling"
            
            # Display results
            cv2.putText(frame, eye_msg, (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
            cv2.putText(frame, sleepy_msg, (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)
            cv2.putText(frame, head_msg, (50, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1)
            cv2.putText(frame, smile_status, (50, 200), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 1)
            
            
    
    cv2.imshow("Real-Time Face Analysis", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
