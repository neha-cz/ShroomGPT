(function () {
  const messagesEl = document.getElementById("messages");
  const form = document.getElementById("form");
  const input = document.getElementById("user-input");
  const sendBtn = document.getElementById("send");
  const emptyHint = document.getElementById("empty");

  let history = [];

  function scrollBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addBubble(text, role, extraClass) {
    if (emptyHint) emptyHint.classList.add("hidden");
    const el = document.createElement("div");
    el.className = "bubble " + role + (extraClass ? " " + extraClass : "");
    el.textContent = text;
    messagesEl.appendChild(el);
    scrollBottom();
    return el;
  }

  function setLoading(on) {
    sendBtn.disabled = on;
    input.readOnly = on;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = (input.value || "").trim();
    if (!text) return;

    addBubble(text, "user");
    input.value = "";
    input.style.height = "auto";
    setLoading(true);
    const typing = addBubble("…", "assistant", "typing");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: history }),
      });
      const data = await res.json().catch(() => ({}));

      typing.remove();

      if (!res.ok) {
        const msg = data.error || data.detail || res.statusText || "Request failed";
        addBubble(String(msg), "assistant", "error");
        return;
      }

      const reply = (data.reply || "").trim() || "…";
      addBubble(reply, "assistant");
      history = history.concat(
        { role: "user", content: text },
        { role: "assistant", content: reply }
      );
      if (history.length > 20) {
        history = history.slice(-20);
      }
    } catch (err) {
      typing.remove();
      addBubble(String(err.message || err), "assistant", "error");
    } finally {
      setLoading(false);
      input.focus();
    }
  });

  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 128) + "px";
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });
})();
