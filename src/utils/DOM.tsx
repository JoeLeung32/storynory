export const DOMTranslationTag = {
    setup: (handleClick: any) => {
        const translationTags = document.querySelectorAll(
            '.storyContent .translationTag'
        )
        if (!translationTags) return
        translationTags.forEach((tag) => {
            tag.addEventListener('click', (event) => handleClick(event))
        })
        // window.addEventListener('resize', DOMTranslationToolTip.hide)
    },
    unset: (handleClick: any) => {
        const translationTags = document.querySelectorAll(
            '.storyContent .translationTag'
        )
        if (!translationTags) return
        translationTags.forEach((tag) => {
            tag.removeEventListener('click', (el) => handleClick(el))
        })
        // window.removeEventListener('resize', DOMTranslationToolTip.hide)
    }
}
