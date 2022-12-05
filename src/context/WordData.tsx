import { useStaticQuery, graphql } from 'gatsby'

export const useWordData = {
    all: () => {
        const {
            allMdx: { nodes }
        } = useStaticQuery(graphqlAllMdxWords)
        return nodes
    },
    index: (index: number | string) => {
        const {
            allMdx: { nodes }
        } = useStaticQuery(graphqlAllMdxWords)
        return index && nodes[index] ? nodes[index] : null
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
