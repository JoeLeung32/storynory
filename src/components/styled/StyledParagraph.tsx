import styled from 'styled-components'

interface StyledParagraphLine {
    standalone?: boolean
}

const StyledParagraph = styled.div`
    display: block;
    // display: none;
    margin-bottom: 1rem;
    /*
    &:nth-last-child(-n+1) {
        display: block;
    }
    */
`

const StyledParagraphLine = styled.div<StyledParagraphLine>`
    display: inline-flex;
    ${(props) => (props.standalone ? 'width: 100%' : 'flex: 1')};
    &[data-highlight='true'] {
        > div {
            background: #ffff8d;
        }
    }
    > div {
        align-items: center;
        border-radius: 1rem;
    }
`

export { StyledParagraph, StyledParagraphLine }
