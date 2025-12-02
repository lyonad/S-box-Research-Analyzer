# Advanced S-Box 44 Analyzer - Frontend

React TypeScript frontend for the S-box cryptographic analysis tool.

## Features

- **Modern Dashboard**: Clean, professional academic interface
- **S-box Visualization**: Interactive 16×16 hexadecimal grid with hover effects
- **Metrics Display**: Comprehensive cryptographic strength analysis results
- **Side-by-Side Comparison**: Compare K44 and AES S-boxes
- **Responsive Design**: Works on desktop and mobile devices

## Technologies

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Axios
- Recharts

## Installation

```bash
npm install
```

## Running the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Building for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── Header.tsx           # Application header
│   ├── ControlPanel.tsx     # Control buttons and info
│   ├── SBoxGrid.tsx         # S-box 16×16 grid visualization
│   ├── MetricsPanel.tsx     # Cryptographic metrics display
│   ├── ComparisonTable.tsx  # Side-by-side comparison
│   └── LoadingSpinner.tsx   # Loading indicator
├── api.ts                   # Backend API service
├── types.ts                 # TypeScript type definitions
├── App.tsx                  # Main application component
├── main.tsx                 # Application entry point
└── index.css                # Global styles
```

## Features

### S-box Grid
- Interactive 16×16 hexadecimal display
- Hover effects showing detailed information
- Click to select cells
- Color-coded for K44 (blue) and AES (purple)

### Metrics Panel
- Nonlinearity (NL)
- Strict Avalanche Criterion (SAC)
- Bit Independence Criterion - Nonlinearity (BIC-NL)
- Bit Independence Criterion - SAC (BIC-SAC)
- Linear Approximation Probability (LAP)
- Differential Approximation Probability (DAP)

### Comparison Table
- Side-by-side metric comparison
- Winner indication for each metric
- Target values displayed
- Color-coded results

## API Integration

The frontend connects to the FastAPI backend at `http://localhost:8000`. Ensure the backend server is running before using the application.

## Styling

The application uses a dark theme with:
- Glass-morphism effects
- Gradient borders
- Smooth transitions
- Professional typography (Inter + Fira Code)

