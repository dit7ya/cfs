import { parse } from "node-html-parser";

async function handleRequest(query: string) {
  const res = await fetch(`https://search.brave.com/search?q=${query}`, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:87.0) Gecko/20100101 Firefox/87.0", // REVIEW switch to something lighter?
    },
  });

  const resultHtml = await res.text();
  const root = parse(resultHtml);
  const snippets = root.querySelectorAll(".result-header");

  // const snippets = root.querySelectorAll(".snippet.fdb");

  // console.log(root.querySelector(".snippet").innerHTML);

  const results = snippets.map((s) => {
    return {
      title: s.querySelector(".snippet-title").innerText,
      url: s.getAttribute("href"),
      // content: s.closest(".fdb").innerText,
    };
  });
  return results;
}

export default {
  async fetch(request: Request, env) {
    const url = new URL(request.url);
    const text = url.searchParams.get("text");
    const resp = await handleRequest(text);
    const view = resp
      .map((s) => `${s.title}\n${s.url}`)
      .reduce((a, b) => a + "\n" + b);

    return new Response(view);
  },
};
