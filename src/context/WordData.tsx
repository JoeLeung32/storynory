import { graphql, useStaticQuery } from 'gatsby'
import { MdxWordsNodes } from '../interfaces/Mdx'

export const useWordData = {
    cache: [],
    all: () => {
        const {
            allMdx: { nodes }
        } = useStaticQuery(graphqlAllMdxWords)
        useWordData.cache = nodes
        return nodes
    },
    index: (index: number | string) => {
        const {
            allMdx: { nodes }
        } = useStaticQuery(graphqlAllMdxWords)
        return index && nodes[index] ? nodes[index] : null
    },
    searchCache: (word: string) => {
        return (
            useWordData.cache.findIndex(
                ({ frontmatter }: MdxWordsNodes) => frontmatter.slug === word
            ) || null
        )
    }
}

const graphqlAllMdxWords = graphql`
    {
        allMdx {
            nodes {
                frontmatter {
                    thirdParty
                    slug
                    title
                    refer
                    partOfSpeech {
                        type
                        en
                        tc
                        examples {
                            en
                            tc
                        }
                        moreExamples
                    }
                }
                body
            }
        }
    }
`
