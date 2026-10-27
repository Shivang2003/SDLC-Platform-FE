import { useRef, useEffect } from "react";

const constructHref = (baseUrl, queryParams) => {
  if (typeof baseUrl !== "string" || !baseUrl.trim()) return null;

  try {
    const url = new URL(baseUrl, window.location.origin);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;

    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    return url.href;
  } catch {
    return null;
  }
};

const renderDelta = (element, delta) => {
  if (!delta || !delta.ops) return;

  element.innerHTML = "";

  delta.ops.forEach((op) => {
    if (typeof op.insert === "string") {
      const lines = op.insert.split("\n");

      lines.forEach((line, index) => {
        let el;

        const attr = op.attributes || {};
        const baseUrl = attr.baseURL ?? attr.baseUrl;
        const href = constructHref(baseUrl, attr.queryParams);

        if (href) {
          el = document.createElement("a");
          el.href = href;
          el.target = "_self";
          el.style.cursor = "pointer";
          el.style.textDecoration = "underline";
        } else {
          el = document.createElement("span");
        }

        el.textContent = line;

        if (attr.bold) el.style.fontWeight = "bold";
        if (attr.italic) el.style.fontStyle = "italic";
        if (attr.underline) el.style.textDecoration = "underline";
        if (attr.color) el.style.color = attr.color;
        if (attr.backgroundColor) {
          el.style.backgroundColor = attr.backgroundColor;
          el.style.padding = "2px 4px";
          el.style.borderRadius = "4px";
        }

        if (attr.mention) {
          el.style.fontWeight = "600";
          el.style.color = attr.mentionTextColor || "black";
          el.style.backgroundColor = attr.mentionBgColor || "#eee";
          el.style.borderRadius = "4px";
          el.style.padding = "2px 4px";
          el.classList.add("mention");

          if (attr.mentionType) el.setAttribute("data-mention-type", attr.mentionType);
          if (attr.id) el.setAttribute("data-mention-id", attr.id);
          if (attr.displayMentionText) el.setAttribute("data-mention-display", attr.displayMentionText);
        }

        if (href) el.style.textDecoration = "none";

        element.appendChild(el);

        if (index < lines.length - 1) {
          element.appendChild(document.createElement("br"));
        }
      });
    }
  });
};

const Renderer = ({ delta }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (delta && containerRef.current) {
      renderDelta(containerRef.current, delta);
    }
  }, [delta]);

  return (
    <div className="flex justify-center items-center">
      <div
        ref={containerRef}
        className="outline-none p-4 text-base leading-relaxed bg-white text-black w-[850px]"
      />
    </div>
  );
};

export default Renderer;
