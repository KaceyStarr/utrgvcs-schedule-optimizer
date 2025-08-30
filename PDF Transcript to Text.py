import os
import pytesseract
from pdf2image import convert_from_path
import re
import json
import csv

# Set Tesseract path
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def convert_pdf_to_images(pdf_path, output_folder='images'):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    try:
        pages = convert_from_path(pdf_path, dpi=300)
    except Exception as e:
        print(f"[ERROR] Failed to convert PDF to images: {e}")
        return []

    image_paths = []
    for i, page in enumerate(pages):
        image_path = os.path.join(output_folder, f"page_{i + 1}.png")
        page.save(image_path, 'PNG')
        image_paths.append(image_path)
    print(f"[INFO] Converted {len(image_paths)} page(s) to images.")
    return image_paths

def extract_text_from_images(image_paths):
    text_all = ""
    for path in image_paths:
        try:
            text = pytesseract.image_to_string(path)
            text_all += text + "\n\n"
        except Exception as e:
            print(f"[ERROR] OCR failed on {path}: {e}")
    print(f"[INFO] Extracted text from {len(image_paths)} image(s).")
    return text_all

def extract_courses(text):
    # Improved regex to capture all relevant course info
    course_pattern = re.compile(
        r'([A-Z]{3,4}\s\d{4})\s+UG\s+(.+?)\s+([A-F][+-]?|DR)\s+(\d\.\d{3})\s+(\d+\.\d{2})'
    )

    matches = course_pattern.findall(text)
    courses = []

    for code, name, grade, credit_hours, quality_points in matches:
        # Clean OCR artifacts from course name
        cleaned_name = (
            name.replace("_", " ")
                .replace("~", "")
                .replace("=", "")
                .strip()
        )
        courses.append({
            "course_code": code.strip(),
            "course_name": cleaned_name,
            "grade": grade.strip(),
            "credithours": float(credit_hours),
            "quality_points": float(quality_points)
        })

    print(f"[INFO] Extracted {len(courses)} course(s) from text.")
    return courses

def save_courses_to_json(courses, filename='extracted_courses.json'):
    # Reorganize list of course dicts into a dictionary keyed by course_code
    organized_courses = {}
    for course in courses:
        code = course["course_code"]
        organized_courses[code] = {
            "name": course["course_name"],
            "grade": course["grade"],
            "credithours": course["credithours"]
        }

    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(organized_courses, f, indent=4)
    print(f"[INFO] Saved courses to {filename}")

def save_courses_to_csv(courses, filename='extracted_courses.csv'):
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=["course_code", "course_name", "grade", "credithours", "quality_points"])
        writer.writeheader()
        writer.writerows(courses)
    print(f"[INFO] Saved courses to {filename}")

def main():
    pdf_file = "Academic Transcript.pdf"
    if not os.path.isfile(pdf_file):
        print(f"[ERROR] PDF file not found: {pdf_file}")
        return

    print("Converting PDF to images...")
    images = convert_pdf_to_images(pdf_file)

    if not images:
        print("[ERROR] No images were generated from PDF.")
        return

    print("Extracting text with OCR...")
    raw_text = extract_text_from_images(images)

    # Optional: print full OCR output
    print("\n=== RAW OCR TEXT ===\n")
    print(raw_text)

    print("\nParsing course entries...")
    courses = extract_courses(raw_text)

    print("\nExtracted Courses:\n")
    for course in courses:
        print(course)

    # Save output to file
    save_courses_to_json(courses)
    save_courses_to_csv(courses)

if __name__ == "__main__":
    main()
