export default function isVisible() {
    document.addEventListener("visibilitychange", () => {
        console.log("value : ", document.hidden)
        return document.hidden;
    });
}
