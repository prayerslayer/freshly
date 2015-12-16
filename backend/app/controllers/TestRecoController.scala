package controllers

import scala.collection.immutable.HashMap

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
    Ok(Json.toJson(counts))
  }
  
  def getArticles(filteredList: Seq[CatalogView]):Seq[UserSearchArticle] = {
    val sessionIds = filteredList.map(x => x.sessionId)
    val filteredUserList = userActionData.filter(entry => sessionIds.contains(entry.sessionId))
    filteredUserList.map(fromDataInput)   
  }
}
