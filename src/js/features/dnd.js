/* ============================================================
   dnd — 看板拖拽辅助（HTML5 Drag & Drop）
   ============================================================ */
window.PM = window.PM || {};

(function () {
  const DnD = {
    /* 让卡片可拖拽，并支持「拖到某卡片之前插入」 */
    enableCard(cardEl, taskId, onDrop) {
      cardEl.setAttribute("draggable", "true");
      cardEl.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", taskId);
        e.dataTransfer.effectAllowed = "move";
        cardEl.classList.add("dragging");
      });
      cardEl.addEventListener("dragend", () => {
        cardEl.classList.remove("dragging");
        cardEl.style.boxShadow = "";
      });
      cardEl.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "move";
        cardEl.style.boxShadow = "0 0 0 2px var(--accent)";
      });
      cardEl.addEventListener("dragleave", () => {
        cardEl.style.boxShadow = "";
      });
      cardEl.addEventListener("drop", (e) => {
        e.preventDefault();
        e.stopPropagation();
        cardEl.style.boxShadow = "";
        const id = e.dataTransfer.getData("text/plain");
        onDrop(id, taskId); // beforeId = 当前卡片
      });
    },

    /* 让列 body 成为放置区（拖到空白处 = 末尾） */
    enableDropZone(bodyEl, statusKey, onDrop) {
      bodyEl.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        bodyEl.closest(".kb-col").classList.add("drop-active");
      });
      bodyEl.addEventListener("dragleave", (e) => {
        if (e.target === bodyEl) bodyEl.closest(".kb-col").classList.remove("drop-active");
      });
      bodyEl.addEventListener("drop", (e) => {
        e.preventDefault();
        bodyEl.closest(".kb-col").classList.remove("drop-active");
        const id = e.dataTransfer.getData("text/plain");
        onDrop(id, null);
      });
    },
  };

  PM.dnd = DnD;
})();
