package controllers

import scala.collection.immutable.HashMap
import scala.collection.parallel.immutable.ParMap

import domain.UserSearchArticle.fromDataInput
import domain.{UserSearchArticle, CatalogView}
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}
import util.{UserDataParser, UserViewParser, CatalogParser}

object TestRecoController extends Controller{
   val catalogData = (new CatalogParser).loadTestFile
  val userViewData = (new UserViewParser).loadTestFile
  val userActionData = (new UserDataParser).loadTestFile
  
  def findBySearchTerm(searchTerm: String) = Action { request =>
     val filteredList: Seq[CatalogView] = catalogData.filter(entry => entry.searchString.equals(searchTerm))
     filteredList match {
       case Seq() => NotFound
       case x => Ok(Json.toJson(getArticles(filteredList)))
     }
  }
  
  def listFoundItemsBySearch = Action { request =>
   val groupedList =  catalogData.groupBy(_.searchString)
    
    val counts = groupedList.map(entry => (entry._1, getArticles(entry._2).size))
    Ok(Json.toJson(counts.filter(_._2 != 0)))
  }
  
  def listFoundItemsWithSale = Action { request =>
    val groupedList =  catalogData.groupBy(_.searchString)
    val mappedList = groupedList.map(entry => (entry._1, getArticles(entry._2)))
    val filteredList = mappedList.filter(elem => elem._2.contains({ cv:UserSearchArticle => cv.action.equals("SALE")}))
    val counts: Map[String, Int] = filteredList.map(entry => (entry._1, entry._2.size))
    Ok(Json.toJson(counts.filter(_._2 != 0)))
  }
  
  def getArticles(filteredList: Seq[CatalogView]):Seq[UserSearchArticle] = {
    val sessionIds = filteredList.map(x => x.sessionId)
    val filteredUserList = userActionData.filter(entry => sessionIds.contains(entry.sessionId))
    filteredUserList.map(fromDataInput)   
  }
}
