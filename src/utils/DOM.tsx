import React from 'react'

const DOMTranslationTag = {
    setup: (handleClick: any) => {
        const translationTags = document.querySelectorAll(
            '.storyContent .translationTag'
        )
        if (!translationTags) return
        translationTags.forEach((tag) => {
            tag.addEventListener('click', (event) => handleClick(event))
        })
        window.addEventListener('resize', DOMTranslationToolTip.hide)
    },
    unset: (handleClick: any) => {
        const translationTags = document.querySelectorAll(
            '.storyContent .translationTag'
        )
        if (!translationTags) return
        translationTags.forEach((tag) => {
            tag.removeEventListener('click', (el) => handleClick(el))
        })
        window.removeEventListener('resize', DOMTranslationToolTip.hide)
    }
}

const DOMTranslationToolTip = {
    show: () => {
        DOMTranslationBottomUp.hide()
    },
    hide: () => {
        const translationTooltip = document.querySelector(
            '.storyContent .translationTooltip'
        ) as HTMLElement
        translationTooltip.classList.remove('show')
        translationTooltip.style.left = '-100%'
        translationTooltip.style.top = '-100%'
    }
}

const DOMTranslationBottomUp = {
    show: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const translationBottomUp = document.querySelector(
            '.storyContent .translationBottomUp'
        ) as HTMLElement
        const target = event.target as HTMLElement
        const parentWrap = target.closest('.translationTooltip') as HTMLElement
        const wordIdx = parentWrap.dataset.wordId
        translationBottomUp.dataset.wordId = wordIdx
        translationBottomUp.classList.add('show')
        DOMTranslationToolTip.hide()
    },
    hide: () => {
        const translationBottomUp = document.querySelector(
            '.storyContent .translationBottomUp'
        ) as HTMLElement
        translationBottomUp.classList.remove('show')
    }
}

export { DOMTranslationTag, DOMTranslationToolTip, DOMTranslationBottomUp }
