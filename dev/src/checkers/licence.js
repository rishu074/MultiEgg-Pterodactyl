export default function licenceChecker() {
    const jsonData = process.licence
    if(!jsonData) {
        error("The was an unexpected error while fetching the licence.")
        process.exit(1)
    }
}