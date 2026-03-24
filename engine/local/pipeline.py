import os
import glob
import json
from .indexer import LocalColPaliIndexer
from .vlm_grader import LocalOllamaGrader 

class LocalPipelineManager:
    def __init__(self):
        self.inputs_dir = "engine/storage/local/inputs"
        self.crops_dir = "engine/storage/local/crops"
        self.reports_dir = "engine/storage/local/reports"

    def run_pipeline(self, questions_list, student_pdfs=None):
        # ==========================================
        # PHASE 1: BATCH EXTRACTION (COLPALI)
        # ==========================================
        print("\n🚀 [PHASE 1] Starting Batch Extraction Pipeline...")
        indexer = LocalColPaliIndexer(storage_dir=self.crops_dir)
        indexer.load_model() 

        print("--> Processing Golden Standard...")
        qp_path = f"{self.inputs_dir}/question_paper.pdf"
        indexer.create_index(qp_path, "idx_qp")
        
        ak_path = f"{self.inputs_dir}/answer_key.pdf"
        if os.path.exists(ak_path):
            indexer.create_index(ak_path, "idx_key")

        for q in questions_list:
            q_id = q["id"]
            q_text = q["context"]
            indexer.extract_crop("idx_qp", q_text, f"golden/q_{q_id}_question", k=1)
            if os.path.exists(ak_path):
                indexer.extract_crop("idx_key", f"Solution for {q_text}", f"golden/q_{q_id}_key", k=1)

        # Use passed list from failover, or fallback to glob
        if not student_pdfs:
            student_pdfs = glob.glob(f"{self.inputs_dir}/students/*.pdf")
        
        print(f"--> Processing {len(student_pdfs)} student scripts...")
        for pdf_path in student_pdfs:
            student_id = os.path.basename(pdf_path).replace('.pdf', '')
            indexer.create_index(pdf_path, f"idx_{student_id}")
            
            for q in questions_list:
                q_id = q["id"]
                search_query = f"Student's handwritten answer for Question {q_id}: {q['context']}"
                indexer.extract_crop(f"idx_{student_id}", search_query, f"students/{student_id}_q_{q_id}", k=2)

        indexer.unload_model()
        print("✅ [PHASE 1 COMPLETE] ColPali unloaded. VRAM cleared.")

        # ==========================================
        # PHASE 2: BATCH GRADING (QWEN3-VL via OLLAMA)
        # ==========================================
        print("\n🚀 [PHASE 2] Starting Batch Grading Pipeline...")
        grader = LocalOllamaGrader() 

        for pdf_path in student_pdfs:
            student_id = os.path.basename(pdf_path).replace('.pdf', '')
            student_report = {"student_id": student_id, "score": 0, "total": 0, "results": []}

            for q in questions_list:
                q_id = q["id"]
                max_pts = q["max_points"]
                student_report["total"] += max_pts
                
                q_img = f"{self.crops_dir}/golden/q_{q_id}_question_part1.png"
                k_img = f"{self.crops_dir}/golden/q_{q_id}_key_part1.png"
                s_imgs = sorted(glob.glob(f"{self.crops_dir}/students/{student_id}_q_{q_id}_part*.png"))

                if s_imgs and os.path.exists(k_img):
                    grade_data = grader.evaluate_answer(q, q_img, k_img, s_imgs)
                    if grade_data:
                        student_report["results"].append(grade_data)
                        student_report["score"] += grade_data.get("awarded_marks", 0)

            report_path = f"{self.reports_dir}/{student_id}_report.json"
            with open(report_path, "w") as f:
                json.dump(student_report, f, indent=4)
            print(f"💾 Saved report to {report_path}")