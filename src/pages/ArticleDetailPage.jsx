import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'
import { getArticleById } from '../data/articles'
import { contentAPI } from '../services/api'
import './ArticleDetailPage.css'

const ArticleDetailPage = () => {
  const { id } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check static first
    const staticArticle = getArticleById(id)
    if (staticArticle) {
      setArticle(staticArticle)
      setLoading(false)
      return
    }

    // Check DB
    contentAPI.getArticles('approved').then(res => {
      if (res.success) {
        const dbArt = res.data.find(a => a.id === id)
        if (dbArt) setArticle(dbArt)
      }
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return <div className="article-detail-page"><div className="article-detail-container"><p>Loading...</p></div></div>
  }

  if (!article || article.type !== 'internal') {
    return (
      <div className="article-detail-page">
        <div className="article-detail-container">
          <p className="article-notfound">Article not found.</p>
          <Link to="/wellness-articles" className="article-back">
            <FaArrowLeft /> Back to Articles
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="article-detail-page">
      <div
        className="article-detail-banner"
        style={{ background: '#' + (article.color || '5b3ba6') }}
      >
        <div className="article-detail-banner-inner">
          <span className="article-detail-tag">Student Article</span>
          <h1>{article.title}</h1>
          <p className="article-detail-meta">
            {article.author}
            {article.date ? ' - ' + article.date : ''}
          </p>
        </div>
      </div>

      <div className="article-detail-container">
        <Link to="/wellness-articles" className="article-back">
          <FaArrowLeft /> Back to Articles
        </Link>

        <div className="article-detail-body">
          {article.body.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ArticleDetailPage
