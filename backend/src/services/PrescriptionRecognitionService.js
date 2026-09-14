/**
 * PrescriptionRecognitionService
 *
 * AI/ML handwriting recognition abstraction layer.
 *
 * CURRENT STATUS: Model integration pending.
 *
 * This service MUST NOT fabricate successful recognition.
 * It returns a controlled status indicating model is unavailable.
 *
 * When the real ML model is ready, only this file needs to change.
 * The prescription workflow, schema, and API remain untouched.
 */

/**
 * Initiate recognition for a prescription file.
 * Returns MODEL_UNAVAILABLE until the real model is integrated.
 */
export async function processPrescription(fileAssetId) {
  // TODO: POST to ML service endpoint, return job ID for polling
  console.log(`[AIService] processPrescription called for fileAssetId=${fileAssetId}. Model not integrated.`);
  return {
    jobId: `pending-${fileAssetId}`,
    status: 'MODEL_UNAVAILABLE',
  };
}

/**
 * Poll recognition job status.
 */
export async function getRecognitionStatus(jobId) {
  // TODO: GET from ML service for job status
  console.log(`[AIService] getRecognitionStatus called for jobId=${jobId}. Model not integrated.`);
  return 'MODEL_UNAVAILABLE';
}

/**
 * Get extraction result for a completed job.
 *
 * In development (AI_DEMO_MODE=true), returns labelled demo data
 * so the human correction UI can be built and tested.
 * Demo data is clearly marked — it is never real AI output.
 */
export async function getExtractionResult(jobId) {
  // Development demo mode — allows testing the review UI
  if (process.env.NODE_ENV === 'development' && process.env.AI_DEMO_MODE === 'true') {
    return {
      job_id: jobId,
      status: 'COMPLETED',
      model_version: 'DEMO_ONLY_v0.0.0',
      processed_at: new Date().toISOString(),
      error_message: null,
      raw_text: '[DEMO] Dr. Patel\nPatient: John Doe\nDate: 14/09/2026\nTab. Amoxicillin 500mg TDS x 7 days\nTab. Paracetamol 650mg SOS',
      fields: [
        { field_name: 'doctor_name',      extracted_value: 'Dr. Patel',    confidence: 0.91, needs_review: false },
        { field_name: 'patient_name',     extracted_value: 'John Doe',     confidence: 0.87, needs_review: false },
        { field_name: 'prescription_date',extracted_value: '2026-09-14',   confidence: 0.72, needs_review: true  },
        { field_name: 'medicine_1_name',  extracted_value: 'Amoxicillin',  confidence: 0.94, needs_review: false },
        { field_name: 'medicine_1_dose',  extracted_value: '500mg',        confidence: 0.88, needs_review: false },
        { field_name: 'medicine_1_freq',  extracted_value: 'TDS',          confidence: 0.78, needs_review: true  },
        { field_name: 'medicine_1_dur',   extracted_value: '7 days',       confidence: 0.83, needs_review: false },
        { field_name: 'medicine_2_name',  extracted_value: 'Paracetamol',  confidence: 0.95, needs_review: false },
        { field_name: 'medicine_2_dose',  extracted_value: '650mg',        confidence: 0.92, needs_review: false },
        { field_name: 'medicine_2_freq',  extracted_value: 'SOS',          confidence: 0.65, needs_review: true  },
      ],
    };
  }

  // Default: model not available
  return {
    job_id: jobId,
    status: 'MODEL_UNAVAILABLE',
    fields: [],
    raw_text: null,
    model_version: null,
    processed_at: null,
    error_message: 'AI recognition model is not yet integrated. Manual review required.',
  };
}
