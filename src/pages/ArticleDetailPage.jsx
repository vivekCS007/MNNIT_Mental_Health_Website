import { useParams, Link } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'
import { getArticleById } from '../data/articles'
import { loadApproved } from './ArticlesPage'
import './ArticleDetailPage.css'

const findArticle = (id) => {
  const approved = loadApproved()
  return approved.find(a => a.id === id) || getArticleById(id)
}

const ArticleDetailPage = () => {
  const { id } = useParams()
  const article = findArticle(id)

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
