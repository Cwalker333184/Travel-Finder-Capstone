document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("bucketInput");
    const addBtn = document.getElementById("addBucketItem");
    const list = document.getElementById("bucketList");
  
    // Load saved items from localStorage
    loadList();
  
    // Add new item on button click
    addBtn.addEventListener("click", () => {
      const value = input.value.trim();
      if (!value) return;
      addListItem(value, false);
      input.value = "";
      saveList();
    });
  
    // Add item function with optional checked state
    function addListItem(text, checked) {
      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-center";
  
      const leftWrapper = document.createElement("div");
      leftWrapper.className = "d-flex align-items-center";
  
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "form-check-input me-2";
      checkbox.checked = checked;
  
      // Save state when checkbox toggled
      checkbox.addEventListener("change", saveList);
  
      const span = document.createElement("span");
      span.textContent = text;
      span.className = "item-text";
  
      leftWrapper.appendChild(checkbox);
      leftWrapper.appendChild(span);
  
      const btnGroup = document.createElement("div");
  
      const editBtn = document.createElement("button");
      editBtn.className = "btn btn-sm btn-warning me-1";
      editBtn.textContent = "Edit";
      editBtn.onclick = () => {
        const newText = prompt("Edit your item:", span.textContent);
        if (newText !== null && newText.trim() !== "") {
          span.textContent = newText.trim();
          saveList();
        }
      };
  
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-sm btn-danger";
      deleteBtn.textContent = "Delete";
      deleteBtn.onclick = () => {
        li.remove();
        saveList();
      };
  
      btnGroup.appendChild(editBtn);
      btnGroup.appendChild(deleteBtn);
  
      li.appendChild(leftWrapper);
      li.appendChild(btnGroup);
  
      list.appendChild(li);
    }
  
    // Save list and checked status to localStorage
    function saveList() {
      const items = [];
      list.querySelectorAll("li").forEach((li) => {
        const text = li.querySelector(".item-text").textContent;
        const checked = li.querySelector("input[type='checkbox']").checked;
        items.push({ text, checked });
      });
      localStorage.setItem("bucketListItems", JSON.stringify(items));
    }
  
    // Load list from localStorage
    function loadList() {
      const saved = localStorage.getItem("bucketListItems");
      if (!saved) return;
      const items = JSON.parse(saved);
      items.forEach(({ text, checked }) => addListItem(text, checked));
    }
  
    // Export selected items to PDF
    document.getElementById("exportPdfBtn").addEventListener("click", () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      const items = document.querySelectorAll("#bucketList input[type='checkbox']:checked");
  
      if (items.length === 0) return alert("Select items to export!");
  
      let y = 10;
      doc.setFontSize(14);
      doc.text("My Travel Bucket List", 10, y);
      y += 10;
  
      items.forEach((item, index) => {
        const text = item.nextSibling.textContent;
        doc.text(`${index + 1}. ${text}`, 10, y);
        y += 10;
      });
  
      doc.save("bucketlist.pdf");
    });
  
    // Export selected items to Text
    document.getElementById("exportTxtBtn").addEventListener("click", () => {
      const items = document.querySelectorAll("#bucketList input[type='checkbox']:checked");
      if (items.length === 0) return alert("Select items to export!");
  
      let text = "My Travel Bucket List:\n\n";
      items.forEach((item, index) => {
        text += `${index + 1}. ${item.nextSibling.textContent}\n`;
      });
  
      const blob = new Blob([text], { type: "text/plain" });
      const link = document.createElement("a");
      link.download = "bucketlist.txt";
      link.href = URL.createObjectURL(blob);
      link.click();
    });
  });
  
  