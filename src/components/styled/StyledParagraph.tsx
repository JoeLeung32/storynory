import styled from 'styled-components'

interface StyledParagraphLine {
    standalone?: boolean
}

const StyledParagraph = styled.div`
    display: block;
    // display: none;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    /*
    &:nth-last-child(-n+1) {
        display: block;
    }
    */
    &:last-child {
        border: 0 none;
    }
`

const StyledParagraphLine = styled.div<StyledParagraphLine>`
    display: inline-flex;
    ${(props) => (props.standalone ? 'width: 100%' : 'flex: 1')};
    > div {
        align-items: center;
        border-radius: 1rem;
    }
`

const StyledParagraphTranslation = styled.div`
    color: #666;
`

export { StyledParagraph, StyledParagraphLine, StyledParagraphTranslation }
