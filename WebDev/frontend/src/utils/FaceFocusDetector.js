import { FaceMesh } from "@mediapipe/face_mesh";

export class FaceFocusDetector {
  constructor(calibrationCount = 10) {
    this.calibrationCount = calibrationCount;
    this.calibrationAngles = [];
    this.baseline = null;
    this.faceMesh = new FaceMesh({
        locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`,
    });

    this.faceMesh.setOptions({
        staticImageMode: false,
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
        useSimd: false, // ⛔️ Disable SIMD temporarily for debugging
      });
  }

  async process(imageData) {
    const img = new Image();
    img.src = imageData;

    return new Promise((resolve, reject) => {
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        await this.faceMesh.send({ image: canvas });

        this.faceMesh.onResults((results) => {
          if (
            !results.multiFaceLandmarks ||
            results.multiFaceLandmarks.length === 0
          ) {
            resolve("Pose Not Detected");
            return;
          }

          const landmarks = results.multiFaceLandmarks[0];
          const pitch = landmarks[10].y - landmarks[152].y;
          const yaw = landmarks[33].x - landmarks[263].x;
          const roll = landmarks[61].x - landmarks[291].x;

          if (this.calibrationCount > 0) {
            this.calibrationAngles.push({ pitch, yaw, roll });
            this.calibrationCount--;
            if (this.calibrationCount === 0) {
              this.baseline = this.calculateAverage(this.calibrationAngles);
            }
            resolve("Calibrating...");
          } else {
            const { pitch: bPitch, yaw: bYaw, roll: bRoll } = this.baseline;
            const relativePitch = Math.abs(pitch - bPitch);
            const relativeYaw = Math.abs(yaw - bYaw);
            const relativeRoll = Math.abs(roll - bRoll);

            if (relativePitch < 0.03 && relativeYaw < 0.03 && relativeRoll < 0.03) {
              resolve("Focused");
            } else {
              resolve("Not Focused");
            }
          }
        });
      };

      img.onerror = () => {
        reject("Error loading image for processing.");
      };
    });
  }

  calculateAverage(angles) {
    const sum = angles.reduce(
      (acc, angle) => ({
        pitch: acc.pitch + angle.pitch,
        yaw: acc.yaw + angle.yaw,
        roll: acc.roll + angle.roll,
      }),
      { pitch: 0, yaw: 0, roll: 0 }
    );

    return {
      pitch: sum.pitch / angles.length,
      yaw: sum.yaw / angles.length,
      roll: sum.roll / angles.length,
    };
  }
}
