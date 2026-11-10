import type { IntakeRecord, Patient } from "./types";

export interface RiskPrediction {
  patientId: string;
  probability: number;
  level: "Высокий" | "Средний" | "Низкий";
  factors: string[];
}

type Vector = [number, number, number, number, number, number, number];

function sigmoid(value: number) {
  return 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, value))));
}

function seeded(index: number) {
  const x = Math.sin(index * 77.31) * 10000;
  return x - Math.floor(x);
}

function generateDataset(size: number) {
  return Array.from({ length: size }, (_, index) => {
    const miss7 = seeded(index + 1) * 0.7;
    const miss30 = seeded(index + 101) * 0.55;
    const avgDelay = seeded(index + 207);
    const streak = seeded(index + 309);
    const evening = seeded(index + 411) > 0.55 ? 1 : 0;
    const doses = seeded(index + 513);
    const weekday = (index % 7) / 6;
    const features: Vector = [miss7, miss30, avgDelay, streak, evening, doses, weekday];
    const latent = -3.15 + miss7 * 3.3 + miss30 * 2.25 + avgDelay * 1.1 + streak * 1.8 + evening * 0.35 + doses * 0.65 + weekday * 0.15;
    const label = seeded(index + 701) < sigmoid(latent) ? 1 : 0;
    return { features, label };
  });
}

function trainLogisticRegression() {
  const dataset = generateDataset(760);
  const training = dataset.slice(0, 610);
  const testing = dataset.slice(610);
  const weights = Array(8).fill(0) as number[];
  const learningRate = 0.42;

  for (let epoch = 0; epoch < 520; epoch += 1) {
    const gradients = Array(8).fill(0) as number[];
    training.forEach(({ features, label }) => {
      const probability = sigmoid(weights[0] + features.reduce((sum, value, featureIndex) => sum + value * weights[featureIndex + 1], 0));
      const error = probability - label;
      gradients[0] += error;
      features.forEach((value, featureIndex) => {
        gradients[featureIndex + 1] += error * value;
      });
    });
    weights.forEach((_, index) => {
      weights[index] -= (learningRate * gradients[index]) / training.length;
    });
  }

  const scored = testing.map(({ features, label }) => ({
    label,
    probability: sigmoid(weights[0] + features.reduce((sum, value, index) => sum + value * weights[index + 1], 0)),
  }));
  const positives = scored.filter((item) => item.label === 1);
  const negatives = scored.filter((item) => item.label === 0);
  let wins = 0;
  positives.forEach((positive) => {
    negatives.forEach((negative) => {
      if (positive.probability > negative.probability) wins += 1;
      else if (positive.probability === negative.probability) wins += 0.5;
    });
  });
  const auc = wins / Math.max(1, positives.length * negatives.length);
  const brier = scored.reduce((sum, item) => sum + (item.probability - item.label) ** 2, 0) / scored.length;
  return { weights, auc, brier };
}

export const mlModel = trainLogisticRegression();

function patientFeatures(patient: Patient, records: IntakeRecord[]): Vector {
  const patientRecords = records.filter((record) => record.patientId === patient.id);
  const recent30 = patientRecords.slice(-Math.max(1, patient.medications.length * 45));
  const recent7 = recent30.slice(-Math.max(1, patient.medications.length * 11));
  const missed7 = recent7.filter((record) => record.status === "missed").length / Math.max(1, recent7.length);
  const missed30 = recent30.filter((record) => record.status === "missed").length / Math.max(1, recent30.length);
  const late = recent30.filter((record) => record.status === "late").length / Math.max(1, recent30.length);
  let streak = 0;
  for (let index = recent30.length - 1; index >= 0; index -= 1) {
    if (recent30[index].status !== "missed") break;
    streak += 1;
  }
  const evening = patient.medications.some((medication) => medication.times.some((time) => time >= "18:00")) ? 1 : 0;
  const doses = Math.min(1, patient.medications.reduce((sum, medication) => sum + medication.times.length, 0) / 5);
  const weekday = Number(patient.id.slice(-2)) % 7 / 6;
  return [missed7, missed30, late, Math.min(1, streak / 3), evening, doses, weekday];
}

export function predictRisk(patient: Patient, records: IntakeRecord[]): RiskPrediction {
  const features = patientFeatures(patient, records);
  const probability = sigmoid(mlModel.weights[0] + features.reduce((sum, value, index) => sum + value * mlModel.weights[index + 1], 0));
  const factors: string[] = [];
  if (features[0] > 0.2) factors.push("пропуски за 7 дней");
  if (features[1] > 0.14) factors.push("нестабильность за 30 дней");
  if (features[2] > 0.12) factors.push("поздние подтверждения");
  if (features[5] > 0.5) factors.push("сложное расписание");
  if (!factors.length) factors.push("стабильное соблюдение расписания");
  return {
    patientId: patient.id,
    probability,
    level: probability >= 0.55 ? "Высокий" : probability >= 0.32 ? "Средний" : "Низкий",
    factors,
  };
}
