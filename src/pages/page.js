import licenceChecker from "../checkers/licence.js";
import error from "../printer/error.js";
import small from "../printer/small.js";
import performEntryScripts from "./entryscripts/perform.js";

export default async function () {
    licenceChecker()

    const { pages } = process.licence
    if(!pages || !pages.default || !pages[pages.default]) {
        error("No page found to display!")
        process.exit(1)
    }

    const page = pages[pages.default]
    if(page.scripts && page.scripts.length != 0) {
        performEntryScripts(page.scripts)
    }
    small(page.title)
    console.log("\n\n")

}