import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_presentation():
    prs = Presentation()
    # 16:9 Widescreen standard
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Premium Color Palette (Dark Mode Tech Theme)
    BG_DARK = RGBColor(15, 23, 42)       # Slate 900
    CARD_BG = RGBColor(30, 41, 59)       # Slate 800
    CARD_BORDER = RGBColor(51, 65, 85)   # Slate 700
    ACCENT_CYAN = RGBColor(6, 182, 212)  # Cyan 500
    ACCENT_INDIGO = RGBColor(99, 102, 241) # Indigo 500
    ACCENT_EMERALD = RGBColor(16, 185, 129) # Emerald 500
    ACCENT_AMBER = RGBColor(245, 158, 11) # Amber 500
    ACCENT_PURPLE = RGBColor(168, 85, 247) # Purple 500
    TEXT_WHITE = RGBColor(248, 250, 252) # White
    TEXT_MUTED = RGBColor(148, 163, 184) # Slate 400
    TEXT_LIGHT = RGBColor(203, 213, 225) # Slate 300

    def add_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.fill.background()
        return bg

    def add_header(slide, tag_text, title_text, subtitle_text, tag_color=ACCENT_CYAN):
        # Category Tag Pill
        tag_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.5), Inches(2.2), Inches(0.36))
        tag_box.fill.solid()
        tag_box.fill.fore_color.rgb = CARD_BG
        tag_box.line.color.rgb = tag_color
        tag_box.line.width = Pt(1.5)
        tf_tag = tag_box.text_frame
        tf_tag.vertical_anchor = MSO_ANCHOR.MIDDLE
        p_tag = tf_tag.paragraphs[0]
        p_tag.text = tag_text.upper()
        p_tag.alignment = PP_ALIGN.CENTER
        p_tag.font.size = Pt(10)
        p_tag.font.bold = True
        p_tag.font.color.rgb = tag_color

        # Slide Title
        t_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.9), Inches(11.5), Inches(0.7))
        tf = t_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.size = Pt(26)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE

        # Subtitle
        s_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(11.5), Inches(0.45))
        s_tf = s_box.text_frame
        s_tf.word_wrap = True
        sp = s_tf.paragraphs[0]
        sp.text = subtitle_text
        sp.font.size = Pt(13)
        sp.font.color.rgb = TEXT_MUTED

    # ==========================================
    # SLIDE 1: Title Slide (Hero)
    # ==========================================
    slide1 = prs.slides.add_slide(blank_layout)
    add_background(slide1)

    # Accent decorative glow bar
    bar = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.3), Inches(0.12), Inches(4.5))
    bar.fill.solid()
    bar.fill.fore_color.rgb = ACCENT_INDIGO
    bar.line.fill.background()

    # Project Badge
    badge = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.2), Inches(1.3), Inches(2.8), Inches(0.4))
    badge.fill.solid()
    badge.fill.fore_color.rgb = CARD_BG
    badge.line.color.rgb = ACCENT_CYAN
    badge.line.width = Pt(1.5)
    b_tf = badge.text_frame
    b_tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    bp = b_tf.paragraphs[0]
    bp.text = "ARCHITECTURE & CAD SYSTEM"
    bp.alignment = PP_ALIGN.CENTER
    bp.font.size = Pt(11)
    bp.font.bold = True
    bp.font.color.rgb = ACCENT_CYAN

    # Main Title
    t_box = slide1.shapes.add_textbox(Inches(1.15), Inches(1.8), Inches(11), Inches(1.5))
    tf = t_box.text_frame
    p1 = tf.paragraphs[0]
    p1.text = "NIRMAAN 2.0"
    p1.font.size = Pt(54)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_WHITE

    p2 = tf.add_paragraph()
    p2.text = "Blueprint to 2D/3D Real-time Design Editor & Layout Auditor"
    p2.font.size = Pt(20)
    p2.font.color.rgb = ACCENT_INDIGO
    p2.font.bold = True

    # Description
    desc_box = slide1.shapes.add_textbox(Inches(1.15), Inches(3.4), Inches(10), Inches(0.8))
    desc_tf = desc_box.text_frame
    desc_p = desc_tf.paragraphs[0]
    desc_p.text = "A complete modern full-stack web CAD solution combining precision 2D floor planning, interactive Three.js 3D spatial rendering, and automated compliance auditing."
    desc_p.font.size = Pt(14)
    desc_p.font.color.rgb = TEXT_MUTED

    # 4 Visual Value Pillars
    pillars = [
        ("🎨 2D Drafting", "HTML5 Canvas CAD", ACCENT_CYAN),
        ("🧊 3D WebGL", "Three.js Spatial Engine", ACCENT_PURPLE),
        ("⚡ FastAPI Async", "High-speed Python Core", ACCENT_INDIGO),
        ("🛡️ Audit Engine", "Rule-based Layout Scoring", ACCENT_EMERALD)
    ]
    p_w = Inches(2.7)
    gap = Inches(0.3)
    start_x = Inches(1.2)
    start_y = Inches(4.7)

    for i, (p_title, p_sub, p_col) in enumerate(pillars):
        card = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, start_x + i * (p_w + gap), start_y, p_w, Inches(1.6))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = p_col
        card.line.width = Pt(1.5)
        
        c_tf = card.text_frame
        c_tf.vertical_anchor = MSO_ANCHOR.MIDDLE
        cp1 = c_tf.paragraphs[0]
        cp1.text = p_title
        cp1.alignment = PP_ALIGN.CENTER
        cp1.font.size = Pt(16)
        cp1.font.bold = True
        cp1.font.color.rgb = TEXT_WHITE

        cp2 = c_tf.add_paragraph()
        cp2.text = p_sub
        cp2.alignment = PP_ALIGN.CENTER
        cp2.font.size = Pt(12)
        cp2.font.color.rgb = TEXT_MUTED

    # ==========================================
    # SLIDE 2: End-to-End Architecture
    # ==========================================
    slide2 = prs.slides.add_slide(blank_layout)
    add_background(slide2)
    add_header(slide2, "End-to-End Flow", "Full-Stack System Architecture", "How data flows seamlessly from browser canvas to async backend and reactive database", ACCENT_CYAN)

    tiers = [
        {
            "num": "01",
            "name": "CLIENT TIER",
            "tech": "React 19 + Three.js",
            "color": ACCENT_CYAN,
            "bullets": [
                "Vite 8 Ultra-fast Dev Server",
                "HTML5 Canvas 2D Vector CAD",
                "Three.js 3D Extrusion & Mesh",
                "Zustand State & TailwindCSS v4"
            ]
        },
        {
            "num": "02",
            "name": "API & LOGIC TIER",
            "tech": "FastAPI + Uvicorn",
            "color": ACCENT_INDIGO,
            "bullets": [
                "Asynchronous Non-blocking IO",
                "Pydantic v2 Schema Validation",
                "JWT Token Bearer Authentication",
                "Deterministic Layout Audit Engine"
            ]
        },
        {
            "num": "03",
            "name": "DATABASE TIER",
            "tech": "MongoDB + Motor",
            "color": ACCENT_EMERALD,
            "bullets": [
                "Motor Async Python Driver",
                "Optimized Unique Email Indexes",
                "Fast Project Lookups via owner_id",
                "SSL/TLS Certifi Cloud Security"
            ]
        }
    ]

    card_w = Inches(3.65)
    t_gap = Inches(0.35)
    t_x = Inches(0.8)
    t_y = Inches(2.2)

    for i, t in enumerate(tiers):
        x = t_x + i * (card_w + t_gap)
        card = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, t_y, card_w, Inches(4.5))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = t["color"]
        card.line.width = Pt(1.5)

        # Inner Badge Header
        c_tf = card.text_frame
        c_tf.word_wrap = True
        
        p_num = c_tf.paragraphs[0]
        p_num.text = f"LAYER {t['num']}"
        p_num.font.size = Pt(11)
        p_num.font.bold = True
        p_num.font.color.rgb = t["color"]

        p_name = c_tf.add_paragraph()
        p_name.text = t["name"]
        p_name.font.size = Pt(20)
        p_name.font.bold = True
        p_name.font.color.rgb = TEXT_WHITE

        p_tech = c_tf.add_paragraph()
        p_tech.text = t["tech"]
        p_tech.font.size = Pt(13)
        p_tech.font.bold = True
        p_tech.font.color.rgb = t["color"]

        c_tf.add_paragraph().text = "" # spacer

        for bullet in t["bullets"]:
            bp = c_tf.add_paragraph()
            bp.text = f"•  {bullet}"
            bp.font.size = Pt(12)
            bp.font.color.rgb = TEXT_LIGHT

    # ==========================================
    # SLIDE 3: Frontend Dual Engine (2D & 3D)
    # ==========================================
    slide3 = prs.slides.add_slide(blank_layout)
    add_background(slide3)
    add_header(slide3, "Visual Experience", "Dual-Engine Interactive Frontend", "Synchronized 2D architectural drafting with real-time 3D spatial viewport", ACCENT_PURPLE)

    # 2 Comparison Columns
    col_w = Inches(5.6)
    c_y = Inches(2.2)

    # Left: 2D Drafting
    card_2d = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), c_y, col_w, Inches(4.5))
    card_2d.fill.solid()
    card_2d.fill.fore_color.rgb = CARD_BG
    card_2d.line.color.rgb = ACCENT_CYAN
    card_2d.line.width = Pt(1.5)

    tf_2d = card_2d.text_frame
    tf_2d.word_wrap = True
    
    p = tf_2d.paragraphs[0]
    p.text = "📐 2D Precision Drafting Engine"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = ACCENT_CYAN

    p_sub = tf_2d.add_paragraph()
    p_sub.text = "HTML5 Canvas Custom CAD Pipeline"
    p_sub.font.size = Pt(12)
    p_sub.font.color.rgb = TEXT_MUTED

    features_2d = [
        ("Snap-to-Grid & Alignment", "Vector mathematical snapping for millimeter-accurate wall joints."),
        ("Interactive Drawing Tools", "Real-time wall generation, door inserts, and window placements."),
        ("Infinite Pan & Zoom", "Dynamic matrix coordinate transformation for complex layouts."),
        ("Zero Overhead", "Hardware accelerated 2D context rendering without bloated CAD libraries.")
    ]
    for title, desc in features_2d:
        tf_2d.add_paragraph().text = ""
        pt = tf_2d.add_paragraph()
        pt.text = f"✔ {title}"
        pt.font.size = Pt(13)
        pt.font.bold = True
        pt.font.color.rgb = TEXT_WHITE

        pd = tf_2d.add_paragraph()
        pd.text = f"    {desc}"
        pd.font.size = Pt(11)
        pd.font.color.rgb = TEXT_LIGHT

    # Right: 3D Engine
    card_3d = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), c_y, col_w, Inches(4.5))
    card_3d.fill.solid()
    card_3d.fill.fore_color.rgb = CARD_BG
    card_3d.line.color.rgb = ACCENT_PURPLE
    card_3d.line.width = Pt(1.5)

    tf_3d = card_3d.text_frame
    tf_3d.word_wrap = True
    
    p = tf_3d.paragraphs[0]
    p.text = "🧊 3D WebGL Spatial Viewport"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = ACCENT_PURPLE

    p_sub = tf_3d.add_paragraph()
    p_sub.text = "Three.js Mesh Extrusion Engine"
    p_sub.font.size = Pt(12)
    p_sub.font.color.rgb = TEXT_MUTED

    features_3d = [
        ("Real-Time Wall Extrusion", "Automatically elevates 2D coordinate vectors into 3D solid wall geometries."),
        ("Dynamic Studio Lighting", "Ambient & directional light sources providing depth and realistic drop shadows."),
        ("Free Orbit & Camera Controls", "Perspective camera with 360° pan, pitch, and distance controls."),
        ("Texture & Surface Materials", "Realistic floor planes, material shaders, and architectural textures.")
    ]
    for title, desc in features_3d:
        tf_3d.add_paragraph().text = ""
        pt = tf_3d.add_paragraph()
        pt.text = f"✔ {title}"
        pt.font.size = Pt(13)
        pt.font.bold = True
        pt.font.color.rgb = TEXT_WHITE

        pd = tf_3d.add_paragraph()
        pd.text = f"    {desc}"
        pd.font.size = Pt(11)
        pd.font.color.rgb = TEXT_LIGHT

    # ==========================================
    # SLIDE 4: Smart Audit Engine & Backend
    # ==========================================
    slide4 = prs.slides.add_slide(blank_layout)
    add_background(slide4)
    add_header(slide4, "Intelligence & Rules", "Automated Blueprint Audit Engine", "Sub-millisecond rule-based compliance scoring checking architectural feasibility", ACCENT_AMBER)

    # 4 Metric Cards for Audit Rules
    rules = [
        ("Base Score", "100 Pts", "Initial pristine blueprint assessment score", ACCENT_CYAN),
        ("Perimeter Check", "-25 Pts", "Requires >= 4 walls for complete room enclosure", ACCENT_AMBER),
        ("Door Accessibility", "-25 Pts", "Requires entry door to guarantee safe human access", ACCENT_PURPLE),
        ("Light & Ventilation", "-15 Pts", "Penalizes zero windows; rewards natural daylight", ACCENT_EMERALD)
    ]
    r_w = Inches(2.7)
    r_gap = Inches(0.3)
    r_x = Inches(0.8)
    r_y = Inches(2.2)

    for i, (rtitle, rstat, rdesc, rcol) in enumerate(rules):
        x = r_x + i * (r_w + r_gap)
        card = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, r_y, r_w, Inches(2.1))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = rcol
        card.line.width = Pt(1.5)

        rtf = card.text_frame
        rtf.word_wrap = True
        
        p = rtf.paragraphs[0]
        p.text = rtitle
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = TEXT_MUTED

        p_stat = rtf.add_paragraph()
        p_stat.text = rstat
        p_stat.font.size = Pt(28)
        p_stat.font.bold = True
        p_stat.font.color.rgb = rcol

        p_desc = rtf.add_paragraph()
        p_desc.text = rdesc
        p_desc.font.size = Pt(11)
        p_desc.font.color.rgb = TEXT_LIGHT

    # Bottom Banner: How the Backend Delivers It
    banner = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(4.6), Inches(11.7), Inches(2.1))
    banner.fill.solid()
    banner.fill.fore_color.rgb = CARD_BG
    banner.line.color.rgb = CARD_BORDER
    banner.line.width = Pt(1)

    btf = banner.text_frame
    btf.word_wrap = True

    bp = btf.paragraphs[0]
    bp.text = "⚡ Backend Execution Highlights (FastAPI Core)"
    bp.font.size = Pt(16)
    bp.font.bold = True
    bp.font.color.rgb = TEXT_WHITE

    b_points = [
        ("Deterministic & Zero I/O", "Calculates validation results in microseconds in-memory without blocking external calls."),
        ("Instant Feedback", "Live score bar (0-100), warnings, architectural suggestions, and safety tips returned instantaneously."),
        ("Pydantic v2 Type Safety", "Strict schema validation ensures blueprint wall/door coordinates conform before ingestion.")
    ]
    for b_title, b_txt in b_points:
        p = btf.add_paragraph()
        p.text = f"•  {b_title}: {b_txt}"
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_LIGHT

    # ==========================================
    # SLIDE 5: Security, Auth & Reactive Storage
    # ==========================================
    slide5 = prs.slides.add_slide(blank_layout)
    add_background(slide5)
    add_header(slide5, "Cloud & Security", "Data Persistence & Enterprise Auth", "Robust asynchronous MongoDB document store backed by industry-standard JWT security", ACCENT_EMERALD)

    # Two Major Pillars
    p_w = Inches(5.6)
    p_y = Inches(2.2)

    # Left: Security & Auth
    card_sec = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), p_y, p_w, Inches(4.5))
    card_sec.fill.solid()
    card_sec.fill.fore_color.rgb = CARD_BG
    card_sec.line.color.rgb = ACCENT_INDIGO
    card_sec.line.width = Pt(1.5)

    stf = card_sec.text_frame
    stf.word_wrap = True

    sp = stf.paragraphs[0]
    sp.text = "🔐 Identity & Security Pipeline"
    sp.font.size = Pt(18)
    sp.font.bold = True
    sp.font.color.rgb = ACCENT_INDIGO

    sec_items = [
        ("OAuth2 Password Bearer Flow", "Stateless authorization header exchange compliant with modern RFC specs."),
        ("Cryptographic JWT Tokens", "HS256 signature tokens managed via python-jose with strict expiry validation."),
        ("Bcrypt Password Hashing", "Adaptive salted hashing via passlib preventing credential leaks."),
        ("Strict CORS Filtering", "Whitelist regex guarding local dev ports and production origins against CSRF.")
    ]
    for title, desc in sec_items:
        stf.add_paragraph().text = ""
        pt = stf.add_paragraph()
        pt.text = f"✔ {title}"
        pt.font.size = Pt(13)
        pt.font.bold = True
        pt.font.color.rgb = TEXT_WHITE

        pd = stf.add_paragraph()
        pd.text = f"    {desc}"
        pd.font.size = Pt(11)
        pd.font.color.rgb = TEXT_LIGHT

    # Right: MongoDB & Storage
    card_db = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), p_y, p_w, Inches(4.5))
    card_db.fill.solid()
    card_db.fill.fore_color.rgb = CARD_BG
    card_db.line.color.rgb = ACCENT_EMERALD
    card_db.line.width = Pt(1.5)

    dtf = card_db.text_frame
    dtf.word_wrap = True

    dp = dtf.paragraphs[0]
    dp.text = "🍃 Reactive MongoDB Architecture"
    dp.font.size = Pt(18)
    dp.font.bold = True
    dp.font.color.rgb = ACCENT_EMERALD

    db_items = [
        ("Motor Async Engine", "Event-loop driven MongoDB driver preventing thread bottlenecks on concurrent design edits."),
        ("Auto-Indexing on Startup", "Automatic creation of unique index on `email` and fast query index on `owner_id`."),
        ("Cloud Ready (TLS / Certifi)", "Native support for MongoDB Atlas connection strings with certifi CA validation."),
        ("Flexible JSON Blueprints", "NoSQL document schema effortlessly stores dynamic arrays of walls, doors & windows.")
    ]
    for title, desc in db_items:
        dtf.add_paragraph().text = ""
        pt = dtf.add_paragraph()
        pt.text = f"✔ {title}"
        pt.font.size = Pt(13)
        pt.font.bold = True
        pt.font.color.rgb = TEXT_WHITE

        pd = dtf.add_paragraph()
        pd.text = f"    {desc}"
        pd.font.size = Pt(11)
        pd.font.color.rgb = TEXT_LIGHT

    # ==========================================
    # SLIDE 6: Verification, Testing & QA
    # ==========================================
    slide6 = prs.slides.add_slide(blank_layout)
    add_background(slide6)
    add_header(slide6, "Quality Assurance", "Testing & Verification Ecosystem", "360-degree quality gates from automated browser workflows to async API suites", ACCENT_CYAN)

    qa_columns = [
        {
            "tag": "E2E BROWSER TESTING",
            "name": "Playwright Suite",
            "stat": "Chromium E2E",
            "color": ACCENT_CYAN,
            "bullets": [
                "Automated end-to-end browser tests",
                "Full user registration & login flows",
                "Canvas click & blueprint interaction tests",
                "Trace recordings on first-retry"
            ]
        },
        {
            "tag": "BACKEND API TESTING",
            "name": "Pytest 8 + HTTPX",
            "stat": "Async ASGI Tests",
            "color": ACCENT_INDIGO,
            "bullets": [
                "In-memory ASGITransport test client",
                "Comprehensive Auth + Project CRUD cycles",
                "Audit engine scoring verification",
                "Pytest-asyncio concurrent execution"
            ]
        },
        {
            "tag": "STATIC CODE QUALITY",
            "name": "Oxlint Engine",
            "stat": "Sub-second Lint",
            "color": ACCENT_EMERALD,
            "bullets": [
                "Next-gen Rust-powered JavaScript linter",
                "Detects React hook anti-patterns instantly",
                "Maintains strict code hygiene",
                "50x faster than legacy ESLint setups"
            ]
        }
    ]

    q_w = Inches(3.65)
    q_gap = Inches(0.35)
    q_x = Inches(0.8)
    q_y = Inches(2.2)

    for i, q in enumerate(qa_columns):
        x = q_x + i * (q_w + q_gap)
        card = slide6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, q_y, q_w, Inches(4.5))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = q["color"]
        card.line.width = Pt(1.5)

        qtf = card.text_frame
        qtf.word_wrap = True

        p_tag = qtf.paragraphs[0]
        p_tag.text = q["tag"]
        p_tag.font.size = Pt(10)
        p_tag.font.bold = True
        p_tag.font.color.rgb = q["color"]

        p_name = qtf.add_paragraph()
        p_name.text = q["name"]
        p_name.font.size = Pt(20)
        p_name.font.bold = True
        p_name.font.color.rgb = TEXT_WHITE

        p_stat = qtf.add_paragraph()
        p_stat.text = q["stat"]
        p_stat.font.size = Pt(13)
        p_stat.font.bold = True
        p_stat.font.color.rgb = q["color"]

        qtf.add_paragraph().text = "" # spacer

        for bullet in q["bullets"]:
            bp = qtf.add_paragraph()
            bp.text = f"•  {bullet}"
            bp.font.size = Pt(12)
            bp.font.color.rgb = TEXT_LIGHT

    output_path = r"c:\Users\tejas\OneDrive\Desktop\Nirmaan 2.0\NIRMAAN_2.0_Presentation.pptx"
    prs.save(output_path)
    print(f"Presentation saved successfully at: {output_path}")

if __name__ == "__main__":
    create_presentation()
