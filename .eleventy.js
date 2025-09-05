import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import Image from "@11ty/eleventy-img";
import markdownIt from "markdown-it";

export default function(eleventyConfig) {
  // Initialize markdown-it
  const md = new markdownIt({
    html: true,
    breaks: true,
    linkify: true
  });

  // Plugins
  eleventyConfig.addPlugin(eleventyNavigationPlugin);

  // Pass through copy
  eleventyConfig.addPassthroughCopy("src/assets/css");
  eleventyConfig.addPassthroughCopy("src/assets/js");
  eleventyConfig.addPassthroughCopy("src/assets/images");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy({ "src/_redirects": "_redirects" });

  // Collections
  eleventyConfig.addCollection("home", function(collection) {
    return collection.getFilteredByGlob("src/content/home.md");
  });

  eleventyConfig.addCollection("pages", function(collection) {
    return collection.getFilteredByGlob("src/content/pages/*.md");
  });

  eleventyConfig.addCollection("programs", function(collection) {
    return collection.getFilteredByGlob("src/content/programs/*.md");
  });

  eleventyConfig.addCollection("news", function(collection) {
    return collection.getFilteredByGlob("src/content/news/*.md")
      .reverse();
  });

  // Filters
  eleventyConfig.addFilter("formatDate", (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  });

  eleventyConfig.addFilter("markdown", (content) => {
    return md.render(content);
  });

  // Shortcodes
  eleventyConfig.addNunjucksAsyncShortcode("image", async function(src, alt, sizes = "100vw") {
    if (!src) {
      return "";
    }

    let metadata = await Image(src, {
      widths: [300, 600, 900, 1200],
      formats: ["webp", "jpeg"],
      outputDir: "./_site/img/",
      urlPath: "/img/",
    });

    let imageAttributes = {
      alt,
      sizes,
      loading: "lazy",
      decoding: "async",
    };

    return Image.generateHTML(metadata, imageAttributes);
  });

  // Watch targets
  eleventyConfig.addWatchTarget("src/assets/css/");
  eleventyConfig.addWatchTarget("src/assets/js/");

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk"
  };
};