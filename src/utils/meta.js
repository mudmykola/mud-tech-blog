export function setMetaTag(name, content) {
    let metaTag = document.querySelector(`meta[name="${name}"]`);
    if (!metaTag) {
        metaTag = document.createElement("meta");
        metaTag.name = name;
        document.head.appendChild(metaTag);
    }
    metaTag.content = content;
}

export function setCanonicalLink(url) {
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.rel = "canonical";
        document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = url;
}
