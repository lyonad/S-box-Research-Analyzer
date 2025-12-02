# ⚡ QUICKSTART - Get Running in 5 Minutes!

## 🎯 What You'll Get

A professional cryptographic research tool that:
- Generates S-boxes using K44 affine matrix from your research paper
- Compares with standard AES S-box
- Runs 6 comprehensive cryptographic strength tests
- Displays results in a beautiful, interactive dashboard

---

## 🚀 Installation (2 minutes)

### Windows - EASY MODE

1. **Install Backend Dependencies**
   - Double-click: `install-backend.bat`
   - Wait for "Installation Complete!"

2. **Install Frontend Dependencies**
   - Double-click: `install-frontend.bat`
   - Wait for "Installation Complete!"

### Mac/Linux

```bash
# Backend
cd backend && pip install -r requirements.txt

# Frontend
cd frontend && npm install
```

---

## 🎬 Running the Application (30 seconds)

### Windows

1. **Start Backend**
   - Double-click: `start-backend.bat`
   - Wait for: "Application startup complete"
   - Keep this window open!

2. **Start Frontend** (in a new window)
   - Double-click: `start-frontend.bat`
   - Browser opens automatically to http://localhost:3000

### Mac/Linux

```bash
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## 🎮 Using the Tool (1 minute)

### Step 1: Click "Generate & Analyze"
```
┌────────────────────────────────────┐
│                                    │
│    [⚡ Generate & Analyze]         │
│                                    │
└────────────────────────────────────┘
```

### Step 2: Wait 3-5 seconds
```
⏳ Generating S-boxes and performing 
   cryptographic analysis...
```

### Step 3: Explore Results!
```
Three tabs available:
┌──────────┬──────────┬──────────────┐
│ K44 S-box│ AES S-box│  Comparison  │
└──────────┴──────────┴──────────────┘
```

---

## 👀 What You'll See

### 1. S-box Grid (16×16 Hexadecimal)
```
     0  1  2  3  4  5  6  7  8  9  A  B  C  D  E  F
  0│ 63 7C 77 7B F2 6B 6F C5 30 01 67 2B FE D7 AB 76
  1│ CA 82 C9 7D FA 59 47 F0 AD D4 A2 AF 9C A4 72 C0
  ... (hover for details, click to select)
```

### 2. Metrics Dashboard
```
┌─────────────────────┐  ┌─────────────────────┐
│ 🔢 Nonlinearity     │  │ 🎯 SAC             │
│ Average: 112.00 ✓   │  │ Average: 0.50073 ✓ │
└─────────────────────┘  └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐
│ 🔗 BIC-NL          │  │ 📊 BIC-SAC         │
│ Average: 103.86     │  │ Deviation: 0.00234  │
└─────────────────────┘  └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐
│ 📐 LAP             │  │ 🎲 DAP             │
│ Max: 0.54297        │  │ Max: 0.03906        │
└─────────────────────┘  └─────────────────────┘
```

### 3. Comparison Table
```
┌──────────────┬──────────┬──────────┬────────┐
│ Metric       │ K44      │ AES      │ Winner │
├──────────────┼──────────┼──────────┼────────┤
│ NL (Avg)     │ 112.00   │ 112.00   │ Equal  │
│ SAC (Avg)    │ 0.50073  │ 0.50073  │ K44 ✓  │
│ BIC-NL (Avg) │ 103.86   │ 103.86   │ Equal  │
└──────────────┴──────────┴──────────┴────────┘
```

---

## 🎯 Verification Checklist

After starting, verify:

- [ ] Backend running at: http://localhost:8000
  - Visit: http://localhost:8000/docs (should show API docs)

- [ ] Frontend running at: http://localhost:3000
  - Should see the dashboard

- [ ] Click "Generate & Analyze"
  - Should complete in 3-5 seconds
  - Should show results in three tabs

---

## 🆘 Troubleshooting

### Backend won't start
```
Problem: "Port 8000 already in use"
Solution: Close any app using port 8000, or change port in main.py
```

### Frontend won't connect
```
Problem: "Unable to connect to backend API"
Solution: Make sure backend is running first!
```

### Python/Node not found
```
Backend: Install Python 3.8+ from python.org
Frontend: Install Node.js 16+ from nodejs.org
```

---

## 📚 Next Steps

Once you have it running:

1. ✅ **Explore the Interface**
   - Try hovering over S-box cells
   - Click cells to lock info
   - Switch between tabs

2. 📖 **Read the Docs**
   - `USAGE_GUIDE.md` - Detailed usage
   - `ARCHITECTURE.md` - How it works
   - `README.md` - Complete overview

3. 🔬 **Understand the Science**
   - Review the research paper
   - Compare K44 vs AES results
   - Analyze the metrics

4. 🎓 **Use for Research**
   - Take screenshots for papers
   - Export data via API
   - Present in academic settings

---

## 🎨 Features Highlight

### Interactive
- ✅ Hover effects on S-box cells
- ✅ Click to lock information
- ✅ Tab navigation
- ✅ Smooth animations

### Comprehensive
- ✅ 6 cryptographic tests
- ✅ Complete analysis in seconds
- ✅ Side-by-side comparison
- ✅ Professional metrics display

### Professional
- ✅ Academic-grade UI
- ✅ Dark professional theme
- ✅ Perfect for presentations
- ✅ Production-quality code

---

## 🎓 For Academic Presentations

### Presentation Mode
1. Press `F11` for fullscreen
2. Go to "Comparison" tab
3. Show side-by-side results
4. Discuss metric differences

### Screenshots
- S-box grids look great in papers
- Metrics panels are publication-ready
- Comparison table is clear and professional

---

## 📊 What Gets Tested

| Test | What It Measures | Target |
|------|-----------------|--------|
| **NL** | Linear resistance | 112 |
| **SAC** | Avalanche effect | ~0.5 |
| **BIC-NL** | Bit independence | High |
| **BIC-SAC** | Independent avalanche | Low deviation |
| **LAP** | Linear attacks | Low |
| **DAP** | Differential attacks | Low |

---

## 🎯 Expected Results

### K44 S-box
- Nonlinearity: ~112 (optimal)
- SAC: ~0.50073 (excellent)
- All other metrics: Competitive with AES

### AES S-box
- Nonlinearity: 112 (optimal)
- SAC: ~0.50073 (excellent)
- Industry standard for comparison

---

## 💡 Pro Tips

1. **Keep backend running** - Saves startup time
2. **Use Comparison tab** - Best overview
3. **Hover over cells** - See detailed info
4. **Check API docs** - http://localhost:8000/docs
5. **Take screenshots** - Great for papers!

---

## 🎉 You're Ready!

That's it! You now have a complete cryptographic research tool.

**Time to first results: ~5 minutes**

Questions? Check these docs:
- `SETUP.md` - Installation help
- `USAGE_GUIDE.md` - Detailed usage
- `README.md` - Full documentation

---

## 📞 API Endpoints

Quick reference:

```bash
# Get comparison
curl http://localhost:8000/compare

# Generate K44 S-box
curl -X POST http://localhost:8000/generate-sbox \
  -H "Content-Type: application/json" \
  -d '{"use_k44": true}'

# Health check
curl http://localhost:8000/health
```

Full API docs: http://localhost:8000/docs

---

**🎯 Goal**: Get you analyzing S-boxes in under 5 minutes
**Status**: Ready to go!
**Support**: Check the documentation files

Happy researching! 🔬

