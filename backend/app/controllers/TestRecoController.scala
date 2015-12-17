package controllers

import scala.collection.immutable.HashMap
import scala.collection.parallel.immutable.ParMap

import domain.UserSearchArticle.fromDataInput
import domain.{SearchTermCount, UserSearchArticle, CatalogView}
import org.joda.time.DateTime
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}
import util.{TraversableOnceExt, UserDataParser, UserViewParser, CatalogParser}

object TestRecoController extends Controller{
  val catalogData = (new CatalogParser).loadTestFile
  val userViewData = (new UserViewParser).loadTestFile
  val userActionData = (new UserDataParser).loadTestFile
  val searchTerms: Map[String, Seq[(DateTime, String)]] = listSearchTermWithSessionIds(catalogData)
  
  def findBySearchTerm(searchTerm: String) = Action { request =>
     val filteredList: Seq[CatalogView] = catalogData.filter(entry => entry.searchString.equals(searchTerm))
     filteredList match {
       case Seq() => NotFound
       case x => Ok(Json.toJson(getArticles(filteredList)))
     }
  }
  
  private def listSearchTermWithSessionIds(data: Seq[CatalogView]): Map[String, Seq[(DateTime, String)]] = {
    val searchTerms: Seq[(String, (DateTime, String))] = data.map(entry => (entry.searchString, (entry.timestamp, entry.sessionId)))
    searchTerms.toMultiMap
  }
  
  def listTrending(count: Int, mode: String) = Action { request =>
    val now = DateTime.now()
    val filteredSearchTerms: Map[String, Seq[(DateTime, String)]] = mode match {
      case "d" => searchTerms.map(entry => entry._1 -> entry._2.filter(x =>  x._1.getMillis > now.minusDays(count).getMillis))
      case "h" => searchTerms.map(entry => entry._1 -> entry._2.filter(x =>  x._1.getMillis > now.minusHours(count).getMillis))
    }
    val counts = filteredSearchTerms map (entry => entry._1 -> entry._2.size)
    val countsSorted = (counts map SearchTermCount.fromTuple).toList.sortWith(_.count > _.count)
     Ok(Json.toJson(countsSorted))
  }
  
  private def listSearchTermHelper(search: Map[String, Seq[(DateTime, String)]]) = {
    val counts = search.map(entry => (entry._1, getArticlesBySessionId(entry._2.map(x => x._2)).size)) 
    counts.filter(_._2 != 0).toList.sortWith(_._2 > _._2) map SearchTermCount.fromTuple
    
  }
  
  def listSearchTerms = Action { request =>
    Ok(Json.toJson(listSearchTermHelper(searchTerms)))
  }
  
  def listSearchTermsWithSale = Action { request =>
    val mappedList = searchTerms.map(entry => (entry._1, getArticlesBySessionId(entry._2.map(x => x._2))))
    val filteredList = mappedList.filter(elem => elem._2.contains({ cv:UserSearchArticle => cv.action.equals("SALE")}))
    val counts =  filteredList.map(entry => (entry._1, entry._2.size))
    val orderedCounts: List[(String, Int)] = counts.filter(_._2 != 0).toList.sortWith(_._2 > _._2)
    Ok(Json.toJson(orderedCounts.map(SearchTermCount.fromTuple)))
  }
  
  def getArticles(filteredList: Seq[CatalogView]):Seq[UserSearchArticle] = {
    val sessionIds = filteredList.map(x => x.sessionId)
    getArticlesBySessionId(sessionIds)
  }
  
  def getArticlesBySessionId(sessionIds: Seq[String]) = {
    val filteredUserList = userActionData.filter(entry => sessionIds.contains(entry.sessionId))
    filteredUserList.map(fromDataInput)
  }
  implicit def commomExtendTraversable[A, C[A] <: TraversableOnce[A]](coll: C[A]): TraversableOnceExt[C[A], A] =
    new TraversableOnceExt[C[A], A](coll, identity)
}
