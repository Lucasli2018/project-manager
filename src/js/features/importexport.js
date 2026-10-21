/* ============================================================
   io — 数据导入 / 导出（JSON）
   ============================================================ */
window.PM = window.PM || {};

(function () {
  const IO = {
    exportJSON() {
      const data = PM.store.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const stamp = PM.utils.fmtDate(new Date()).replace(/-/g, "");
      a.href = url;
      a.download = "project-data-" + stamp + ".json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      PM.ui.toast("已导出 JSON 文件", "ok");
    },

    importJSONFile(file, onDone) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const obj = JSON.parse(reader.result);
          PM.store.importData(obj);
          PM.ui.toast("数据导入成功", "ok");
          onDone && onDone();
        } catch (e) {
          console.error(e);
          PM.ui.toast("导入失败：" + e.message, "err");
        }
      };
      reader.onerror = () => PM.ui.toast("读取文件失败", "err");
      reader.readAsText(file);
    },
  };

  PM.io = IO;
})();
