export const DOMStory = {
    autoScrollTo: (id: string, highlighter: boolean) => {
        const paragraph = document.querySelector(`.storyContent #${id}`)
        if (!paragraph || !highlighter) return
        paragraph.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
        })
    }
}
