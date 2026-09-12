"""
Visor de Reportes de Campo - PYME Agrícola
"""
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import customtkinter as ctk
import pandas as pd
import openpyxl
from pathlib import Path
import datetime
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import matplotlib
matplotlib.use("TkAgg")

# ─── Tema ────────────────────────────────────────────────────────────────────
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("green")

EXCEL_DIR = Path(r"E:\PYME\expo\excel")

SHEET_MAP = {
    "Rendimiento Diario Jornal": "rendimiento",
    "Rendimiento Diario  Jornal": "rendimiento",
    "Maquinaria": "maquinaria",
    "Insumos": "insumos",
    "Catálogos": "catalogos",
    "Resumen Semanal": "resumen",
}

# Columnas numéricas por hoja (para gráficas)
NUMERIC_COLS = {
    "rendimiento": ["N° de Personas", "num_personas", "Cantidad Realizada",
                    "cantidad_realizada", "Meta de Rendimiento (jornal)", "meta_jornal",
                    "% Cumplimiento", "pct_cumplimiento"],
    "maquinaria": ["Litros", "Precio/L", "Costo Total", "Avance/Rendim. (ha)"],
    "insumos": ["Cantidad", "Costo por Unidad", "Costo Total"],
}


# ─── Helpers ─────────────────────────────────────────────────────────────────

def load_excel(path: Path) -> dict[str, pd.DataFrame]:
    """Carga todas las hojas del Excel y devuelve {nombre: DataFrame}."""
    sheets = {}
    try:
        xf = pd.ExcelFile(path, engine="openpyxl")
        for name in xf.sheet_names:
            try:
                df = pd.read_excel(xf, sheet_name=name, engine="openpyxl")
                # Eliminar filas y columnas completamente vacías
                df = df.dropna(how="all").dropna(axis=1, how="all")
                sheets[name] = df
            except Exception:
                pass
    except Exception as e:
        messagebox.showerror("Error", f"No se pudo leer el archivo:\n{e}")
    return sheets


def format_value(val):
    if pd.isna(val) if not isinstance(val, str) else False:
        return ""
    if isinstance(val, datetime.datetime):
        return val.strftime("%d/%m/%Y")
    if isinstance(val, float) and val == int(val):
        return str(int(val))
    return str(val)


# ─── Widget: tabla con scroll y búsqueda ─────────────────────────────────────

class DataTable(ctk.CTkFrame):
    def __init__(self, master, **kw):
        super().__init__(master, **kw)
        self._df: pd.DataFrame | None = None
        self._filtered: pd.DataFrame | None = None

        # Barra de búsqueda
        top = ctk.CTkFrame(self, fg_color="transparent")
        top.pack(fill="x", padx=8, pady=(8, 4))
        ctk.CTkLabel(top, text="Buscar:").pack(side="left", padx=(0, 6))
        self._search_var = tk.StringVar()
        self._search_var.trace_add("write", lambda *_: self._apply_filter())
        ctk.CTkEntry(top, textvariable=self._search_var, width=280,
                     placeholder_text="filtrar cualquier columna…").pack(side="left")
        self._count_label = ctk.CTkLabel(top, text="")
        self._count_label.pack(side="right", padx=8)

        # Treeview
        tree_frame = ctk.CTkFrame(self, fg_color="transparent")
        tree_frame.pack(fill="both", expand=True, padx=8, pady=4)

        style = ttk.Style()
        style.theme_use("clam")
        style.configure("Custom.Treeview",
                        background="#2b2b2b", foreground="#e0e0e0",
                        fieldbackground="#2b2b2b", rowheight=26,
                        font=("Segoe UI", 10))
        style.configure("Custom.Treeview.Heading",
                        background="#1a472a", foreground="white",
                        font=("Segoe UI", 10, "bold"))
        style.map("Custom.Treeview",
                  background=[("selected", "#2d6a4f")],
                  foreground=[("selected", "white")])

        self._tree = ttk.Treeview(tree_frame, style="Custom.Treeview",
                                  show="headings", selectmode="browse")
        vsb = ttk.Scrollbar(tree_frame, orient="vertical", command=self._tree.yview)
        hsb = ttk.Scrollbar(tree_frame, orient="horizontal", command=self._tree.xview)
        self._tree.configure(yscrollcommand=vsb.set, xscrollcommand=hsb.set)

        vsb.pack(side="right", fill="y")
        hsb.pack(side="bottom", fill="x")
        self._tree.pack(fill="both", expand=True)

        # Tags para filas alternas
        self._tree.tag_configure("odd", background="#333333")
        self._tree.tag_configure("even", background="#2b2b2b")

        self._sort_col = None
        self._sort_asc = True

    def load(self, df: pd.DataFrame):
        self._df = df.copy()
        self._search_var.set("")
        self._apply_filter()

    def _apply_filter(self):
        if self._df is None:
            return
        q = self._search_var.get().strip().lower()
        if q:
            mask = self._df.astype(str).apply(
                lambda col: col.str.lower().str.contains(q, na=False)
            ).any(axis=1)
            self._filtered = self._df[mask].copy()
        else:
            self._filtered = self._df.copy()
        self._render()

    def _render(self):
        df = self._filtered
        self._tree.delete(*self._tree.get_children())

        cols = list(df.columns)
        self._tree["columns"] = cols
        for c in cols:
            self._tree.heading(c, text=c,
                               command=lambda col=c: self._sort_by(col))
            width = max(100, min(220, len(str(c)) * 11))
            self._tree.column(c, width=width, anchor="w", minwidth=60)

        for i, (_, row) in enumerate(df.iterrows()):
            vals = [format_value(v) for v in row]
            tag = "odd" if i % 2 else "even"
            self._tree.insert("", "end", values=vals, tags=(tag,))

        self._count_label.configure(
            text=f"{len(df):,} registros"
            + (f" de {len(self._df):,}" if len(df) != len(self._df) else "")
        )

    def _sort_by(self, col):
        if self._filtered is None:
            return
        if self._sort_col == col:
            self._sort_asc = not self._sort_asc
        else:
            self._sort_col = col
            self._sort_asc = True
        self._filtered = self._filtered.sort_values(
            col, ascending=self._sort_asc, na_position="last"
        )
        self._render()


# ─── Widget: panel de gráfica ─────────────────────────────────────────────────

class ChartPanel(ctk.CTkFrame):
    def __init__(self, master, **kw):
        super().__init__(master, **kw)
        self._canvas = None
        self._df = None
        self._sheet_key = None

        ctrl = ctk.CTkFrame(self, fg_color="transparent")
        ctrl.pack(fill="x", padx=8, pady=8)

        ctk.CTkLabel(ctrl, text="Agrupar por:").pack(side="left", padx=(0, 6))
        self._group_var = tk.StringVar(value="")
        self._group_cb = ctk.CTkComboBox(ctrl, variable=self._group_var, width=200,
                                         command=lambda _: self._draw())
        self._group_cb.pack(side="left", padx=4)

        ctk.CTkLabel(ctrl, text="Valor:").pack(side="left", padx=(12, 6))
        self._val_var = tk.StringVar(value="")
        self._val_cb = ctk.CTkComboBox(ctrl, variable=self._val_var, width=220,
                                       command=lambda _: self._draw())
        self._val_cb.pack(side="left", padx=4)

        ctk.CTkLabel(ctrl, text="Tipo:").pack(side="left", padx=(12, 6))
        self._chart_var = tk.StringVar(value="Barras")
        ctk.CTkComboBox(ctrl, variable=self._chart_var, width=120,
                        values=["Barras", "Línea", "Pastel"],
                        command=lambda _: self._draw()).pack(side="left", padx=4)

        self._plot_area = ctk.CTkFrame(self, fg_color="#1e1e1e")
        self._plot_area.pack(fill="both", expand=True, padx=8, pady=8)

        self._placeholder = ctk.CTkLabel(
            self._plot_area,
            text="Selecciona 'Agrupar por' y 'Valor' para generar la gráfica",
            text_color="#666666", font=("Segoe UI", 13)
        )
        self._placeholder.place(relx=0.5, rely=0.5, anchor="center")

    def load(self, df: pd.DataFrame, sheet_key: str):
        self._df = df.copy()
        self._sheet_key = sheet_key

        # Columnas categóricas para agrupar
        cat_cols = [c for c in df.columns
                    if df[c].dtype == object or str(df[c].dtype) == "datetime64[ns]"]
        # Columnas numéricas
        num_cols = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]

        self._group_cb.configure(values=cat_cols)
        self._val_cb.configure(values=num_cols)

        if cat_cols:
            self._group_var.set(cat_cols[0])
        if num_cols:
            self._val_var.set(num_cols[0])

        self._draw()

    def _draw(self):
        group = self._group_var.get()
        val = self._val_var.get()
        chart = self._chart_var.get()

        if not group or not val or self._df is None:
            return
        if group not in self._df.columns or val not in self._df.columns:
            return

        df = self._df[[group, val]].dropna()
        if df.empty:
            return

        grouped = df.groupby(group)[val].sum().sort_values(ascending=False).head(15)
        if grouped.empty:
            return

        # Limpiar canvas anterior
        for w in self._plot_area.winfo_children():
            w.destroy()

        fig, ax = plt.subplots(figsize=(9, 4), facecolor="#1e1e1e")
        ax.set_facecolor("#2b2b2b")
        colors = ["#2d6a4f", "#40916c", "#52b788", "#74c69d", "#95d5b2"]

        if chart == "Barras":
            bars = ax.bar(range(len(grouped)), grouped.values,
                          color=[colors[i % len(colors)] for i in range(len(grouped))])
            ax.set_xticks(range(len(grouped)))
            ax.set_xticklabels([str(l)[:18] for l in grouped.index],
                               rotation=35, ha="right", color="#cccccc", fontsize=8)
            for bar in bars:
                h = bar.get_height()
                ax.text(bar.get_x() + bar.get_width() / 2, h * 1.01,
                        f"{h:,.0f}", ha="center", va="bottom",
                        color="white", fontsize=7)

        elif chart == "Línea":
            ax.plot(range(len(grouped)), grouped.values,
                    color="#52b788", marker="o", linewidth=2, markersize=5)
            ax.fill_between(range(len(grouped)), grouped.values,
                            alpha=0.2, color="#52b788")
            ax.set_xticks(range(len(grouped)))
            ax.set_xticklabels([str(l)[:18] for l in grouped.index],
                               rotation=35, ha="right", color="#cccccc", fontsize=8)

        elif chart == "Pastel":
            wedge_colors = ["#2d6a4f", "#40916c", "#52b788", "#74c69d",
                            "#95d5b2", "#b7e4c7", "#d8f3dc", "#1b4332",
                            "#081c15", "#e9c46a", "#f4a261", "#e76f51"]
            ax.pie(grouped.values, labels=[str(l)[:16] for l in grouped.index],
                   colors=wedge_colors[:len(grouped)],
                   autopct="%1.1f%%", textprops={"color": "white", "fontsize": 8},
                   startangle=90)

        ax.set_title(f"{val} por {group}", color="white", fontsize=11, pad=10)
        ax.tick_params(colors="#aaaaaa")
        for spine in ax.spines.values():
            spine.set_edgecolor("#444444")
        ax.yaxis.label.set_color("#cccccc")
        fig.tight_layout()

        canvas = FigureCanvasTkAgg(fig, master=self._plot_area)
        canvas.draw()
        canvas.get_tk_widget().pack(fill="both", expand=True)
        self._canvas = canvas
        plt.close(fig)


# ─── Panel de resumen / KPIs ──────────────────────────────────────────────────

class SummaryPanel(ctk.CTkFrame):
    def __init__(self, master, **kw):
        super().__init__(master, fg_color="transparent", **kw)

    def load(self, sheets: dict[str, pd.DataFrame]):
        for w in self.winfo_children():
            w.destroy()

        ctk.CTkLabel(self, text="Resumen del Reporte",
                     font=("Segoe UI", 16, "bold")).pack(pady=(16, 8))

        cards = ctk.CTkFrame(self, fg_color="transparent")
        cards.pack(fill="x", padx=16, pady=8)

        kpis = self._compute_kpis(sheets)
        for i, (title, value, sub) in enumerate(kpis):
            card = ctk.CTkFrame(cards, corner_radius=12, fg_color="#1a472a")
            card.grid(row=0, column=i, padx=8, pady=4, sticky="nsew")
            cards.columnconfigure(i, weight=1)
            ctk.CTkLabel(card, text=title, font=("Segoe UI", 10),
                         text_color="#95d5b2").pack(pady=(14, 2))
            ctk.CTkLabel(card, text=value, font=("Segoe UI", 22, "bold"),
                         text_color="white").pack()
            ctk.CTkLabel(card, text=sub, font=("Segoe UI", 9),
                         text_color="#74c69d").pack(pady=(2, 14))

        # Tabla resumen por hoja
        detail = ctk.CTkFrame(self, corner_radius=10)
        detail.pack(fill="both", expand=True, padx=16, pady=8)
        ctk.CTkLabel(detail, text="Hojas disponibles",
                     font=("Segoe UI", 12, "bold")).pack(anchor="w", padx=12, pady=8)

        for name, df in sheets.items():
            row = ctk.CTkFrame(detail, fg_color="#2b2b2b", corner_radius=6)
            row.pack(fill="x", padx=8, pady=3)
            ctk.CTkLabel(row, text=f"  {name}", anchor="w",
                         font=("Segoe UI", 10)).pack(side="left", padx=4, pady=6)
            ctk.CTkLabel(row, text=f"{len(df):,} filas × {len(df.columns)} cols",
                         text_color="#74c69d", font=("Segoe UI", 10)).pack(side="right", padx=12)

    def _compute_kpis(self, sheets):
        kpis = []
        # Total registros
        total = sum(len(df) for df in sheets.values())
        kpis.append(("Total Registros", f"{total:,}", "en todas las hojas"))

        # Hojas cargadas
        kpis.append(("Hojas", str(len(sheets)), "disponibles"))

        # Rango de fechas (buscar columna Fecha)
        fechas = []
        for df in sheets.values():
            for col in df.columns:
                if "fecha" in str(col).lower() or "date" in str(col).lower():
                    vals = pd.to_datetime(df[col], errors="coerce").dropna()
                    fechas.extend(vals.tolist())
        if fechas:
            mn = min(fechas).strftime("%d/%m/%y")
            mx = max(fechas).strftime("%d/%m/%y")
            kpis.append(("Período", mx, f"desde {mn}"))
        else:
            kpis.append(("Período", "—", "sin fechas"))

        return kpis


# ─── Ventana principal ────────────────────────────────────────────────────────

class App(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("Visor de Reportes de Campo")
        self.geometry("1280x780")
        self.minsize(900, 600)

        self._sheets: dict[str, pd.DataFrame] = {}
        self._file_path: Path | None = None

        self._build_ui()

    # ── Layout ──────────────────────────────────────────────────────────────

    def _build_ui(self):
        # Barra lateral
        sidebar = ctk.CTkFrame(self, width=220, corner_radius=0, fg_color="#111111")
        sidebar.pack(side="left", fill="y")
        sidebar.pack_propagate(False)

        ctk.CTkLabel(sidebar, text="🌿 Campo", font=("Segoe UI", 18, "bold"),
                     text_color="#52b788").pack(pady=(24, 4))
        ctk.CTkLabel(sidebar, text="Visor de Reportes", font=("Segoe UI", 10),
                     text_color="#74c69d").pack(pady=(0, 24))

        ctk.CTkButton(sidebar, text="Abrir Excel…", height=40,
                      command=self._open_file, fg_color="#2d6a4f",
                      hover_color="#40916c").pack(padx=16, pady=4, fill="x")

        ctk.CTkButton(sidebar, text="Carpeta de reportes", height=36,
                      command=self._open_reports_dir,
                      fg_color="#1b4332", hover_color="#2d6a4f").pack(padx=16, pady=4, fill="x")

        self._file_label = ctk.CTkLabel(sidebar, text="Sin archivo", wraplength=190,
                                        text_color="#666666", font=("Segoe UI", 9))
        self._file_label.pack(padx=16, pady=(12, 0))

        ttk.Separator(sidebar, orient="horizontal").pack(fill="x", padx=12, pady=20)

        ctk.CTkLabel(sidebar, text="Hojas", font=("Segoe UI", 11, "bold"),
                     text_color="#95d5b2").pack(anchor="w", padx=16)
        self._sheet_list = ctk.CTkScrollableFrame(sidebar, fg_color="transparent",
                                                  height=260)
        self._sheet_list.pack(fill="x", padx=8)

        # Área principal
        main = ctk.CTkFrame(self, fg_color="#1e1e1e", corner_radius=0)
        main.pack(side="right", fill="both", expand=True)

        self._notebook = ctk.CTkTabview(main, fg_color="#252525",
                                        segmented_button_fg_color="#1a472a",
                                        segmented_button_selected_color="#2d6a4f",
                                        segmented_button_selected_hover_color="#40916c")
        self._notebook.pack(fill="both", expand=True, padx=12, pady=12)

        # Pestaña inicio
        self._tab_inicio = self._notebook.add("Inicio")
        self._welcome = ctk.CTkLabel(
            self._tab_inicio,
            text="Abre un archivo Excel para comenzar",
            font=("Segoe UI", 15), text_color="#555555"
        )
        self._welcome.place(relx=0.5, rely=0.5, anchor="center")

    # ── Acciones ────────────────────────────────────────────────────────────

    def _open_file(self):
        initial = str(EXCEL_DIR) if EXCEL_DIR.exists() else str(Path.home())
        path = filedialog.askopenfilename(
            title="Seleccionar reporte Excel",
            initialdir=initial,
            filetypes=[("Excel", "*.xlsx *.xlsm *.xls"), ("Todos", "*.*")]
        )
        if not path:
            return
        self._load(Path(path))

    def _open_reports_dir(self):
        path = filedialog.askopenfilename(
            title="Seleccionar reporte",
            initialdir=str(EXCEL_DIR) if EXCEL_DIR.exists() else str(Path.home()),
            filetypes=[("Excel", "*.xlsx *.xlsm *.xls")]
        )
        if path:
            self._load(Path(path))

    def _load(self, path: Path):
        self._file_path = path
        self._file_label.configure(text=path.name, text_color="#95d5b2")
        self._sheets = load_excel(path)
        if not self._sheets:
            return
        self._rebuild_tabs()
        self._rebuild_sheet_list()

    def _rebuild_sheet_list(self):
        for w in self._sheet_list.winfo_children():
            w.destroy()
        for name in self._sheets:
            btn = ctk.CTkButton(
                self._sheet_list, text=name, anchor="w", height=32,
                fg_color="transparent", hover_color="#2d6a4f",
                font=("Segoe UI", 10),
                command=lambda n=name: self._notebook.set(n)
            )
            btn.pack(fill="x", pady=1)

    def _rebuild_tabs(self):
        # Quitar pestañas anteriores excepto "Inicio"
        for tab in list(self._notebook._tab_dict.keys()):
            if tab != "Inicio":
                self._notebook.delete(tab)

        # Pestaña resumen
        tab_res = self._notebook.add("Resumen")
        sp = SummaryPanel(tab_res)
        sp.pack(fill="both", expand=True)
        sp.load(self._sheets)

        # Una pestaña por hoja
        for name, df in self._sheets.items():
            tab = self._notebook.add(name)
            inner = ctk.CTkTabview(tab, fg_color="transparent",
                                   segmented_button_fg_color="#1b4332",
                                   segmented_button_selected_color="#40916c")
            inner.pack(fill="both", expand=True)

            t_data = inner.add("Datos")
            table = DataTable(t_data)
            table.pack(fill="both", expand=True)
            table.load(df)

            t_chart = inner.add("Gráfica")
            key = SHEET_MAP.get(name, "")
            chart = ChartPanel(t_chart)
            chart.pack(fill="both", expand=True)
            chart.load(df, key)

        self._notebook.set("Resumen")


# ─── Entry point ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    app = App()
    app.mainloop()
