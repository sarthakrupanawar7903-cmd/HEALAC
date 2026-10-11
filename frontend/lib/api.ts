import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 120000,
});

export interface UploadResponse {
  status: string;
  record_id: number;
  data: {
    patient_context: {
      patient_id: string;
      abha_linked: boolean;
      name: string;
      age: number;
      gender: string;
    };
    document_metadata: {
      file_name: string;
      upload_date: string;
      document_type: string;
      facility_name: string;
    };
    fhir_resources: {
      DiagnosticReport: Array<{
        test_name: string;
        value: number;
        unit: string;
        reference_range: string;
        status: string;
        date: string;
      }>;
      MedicationRequest: Array<{
        medicine_name: string;
        dosage: string;
        frequency: string;
        timing: string;
        prescribed_by: string;
        date: string;
      }>;
      Condition: Array<{
        condition_name: string;
        clinical_status: string;
      }>;
    };
    ai_insights: {
      plain_language_summary: string;
      hindi_summary: string;
      trend_analysis: string;
      drug_interactions: Array<{
        severity: string;
        description: string;
        recommendation: string;
      }>;
      questions_to_ask_doctor: Array<{
        question_en: string;
        question_hi: string;
        rationale: string;
      }>;
    };
  };
}

export interface RecordListItem {
  id: number;
  patient_id: string;
  document_type: string;
  file_name: string;
  created_at: string;
}

export async function uploadDocument(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post<UploadResponse>("/api/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function getRecords(): Promise<RecordListItem[]> {
  const { data } = await api.get<RecordListItem[]>("/api/records");
  return data;
}

export async function getRecord(id: number): Promise<UploadResponse["data"]> {
  const { data } = await api.get(`/api/records/${id}`);
  return data;
}

export async function sendChatMessage(
  patientId: string,
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const { data } = await api.post("/api/chat", {
    patient_id: patientId,
    messages,
  });
  return data.reply;
}