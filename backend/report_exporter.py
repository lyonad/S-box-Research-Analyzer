"""
Utilities for exporting analysis results into different formats.
Currently supports CSV with future extension hooks for PDF/LaTeX reports.
"""

import csv
import io
import json
from typing import Any, Dict


def _serialize_value(value: Any) -> str:
    """Convert nested analysis values into a readable CSV-friendly string."""
    if isinstance(value, (int, float)):
        return f"{value}"
    if isinstance(value, list):
        if value and isinstance(value[0], (list, dict)):
            return json.dumps(value)
        return ", ".join(_serialize_value(item) for item in value)
    if isinstance(value, dict):
        return json.dumps(value)
    if value is None:
        return ""
    return str(value)


def generate_analysis_csv(sbox_name: str, analysis: Dict[str, Any], analysis_time_ms: float) -> str:
    """
    Convert analysis metrics into a CSV string.

    Args:
        sbox_name: Human-readable S-box identifier.
        analysis: Dictionary containing analysis metrics (AnalysisMetrics.dict()).
        analysis_time_ms: Time taken to produce the analysis, in milliseconds.
    """
    rows = [
        {"metric": "sbox_name", "field": "label", "value": sbox_name},
        {"metric": "analysis_time_ms", "field": "value", "value": f"{analysis_time_ms}"},
    ]

    for metric, data in analysis.items():
        if isinstance(data, dict):
            for field, value in data.items():
                rows.append({
                    "metric": metric,
                    "field": field,
                    "value": _serialize_value(value)
                })
        else:
            rows.append({
                "metric": metric,
                "field": "",
                "value": _serialize_value(data)
            })

    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=["metric", "field", "value"])
    writer.writeheader()
    writer.writerows(rows)

    return buffer.getvalue()

