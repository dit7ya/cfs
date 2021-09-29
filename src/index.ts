import { parse } from "node-html-parser";

async function handleRequest(query: string) {
  const res = await fetch(`https://search.brave.com/search?q=${query}`, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:87.0) Gecko/20100101 Firefox/87.0", // REVIEW switch to something lighter?
    },
  });

  const resultHtml = (await res.text()).replaceAll('data-type="web"\n', ""); // REVIEW ugly HACK
  const root = parse(resultHtml);
  // const snippets = root.querySelectorAll(".result-header");

  const snippets = root.querySelectorAll(".snippet.fdb");

  // console.log(root.querySelector(".snippet").innerHTML);

  const results = snippets.map((s) => {
    return {
      title: s.querySelector(".snippet-title").innerText,
      // url: s.getAttribute("href"),
      url: s.querySelector(".result-header").getAttribute("href"),
      content: s.querySelector(".snippet-description").innerText,
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
      .map(
        (s, idx) =>
          `<div><p>${idx}  ${s.title}</p><p>${s.url}</p><p>${s.content}</p></div>`
      )
      .reduce((a, b) => a + "\n\n\n" + b);

    const html = `

<!DOCTYPE html>
<html class="no-js" lang="">
<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>Untitled</title>
    <meta name="description" content="">
    <meta name="viewport" content=
    "width=device-width, initial-scale=1">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <!-- Place favicon.ico in the root directory -->
</head>
<body>
${view}
</body>
</html>

`;

    return new Response(html, { headers: { "Content-Type": "text/html" } });
  },
};
