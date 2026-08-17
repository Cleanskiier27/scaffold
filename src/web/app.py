"""
src/web/app.py — Web application server for LunaRecycle-OS.
"""

from __future__ import annotations

import os
from typing import Any
from flask import Flask, render_template

from src.api.routes import api_bp


def create_app() -> Flask:
    """Create and configure the Flask web application."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    template_folder = os.path.join(base_dir, "templates")
    static_folder = os.path.join(base_dir, "static")

    app = Flask(
        __name__,
        template_folder=template_folder,
        static_folder=static_folder,
    )

    # Register API blueprint
    app.register_blueprint(api_bp)

    @app.route("/")
    def index() -> Any:
        return render_template("index.html")

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="127.0.0.1", port=8080, debug=True)
