package controllers

import controllers.Application._
import domain.Article
import play.api.libs.json.{JsArray, Json, JsNull}

import play.api.mvc.Action


import play.mvc.Controller
import services.{ShopTheLook, ShopClient}

import scala.concurrent.Future


object ArticleController extends Controller{
    def articlesToJson(articles : List[Article]) = Json.toJson(articles.map(article => article.toJson))
  
    def get(category: Option[String], like: Option[String], dislike: Option[String], gender: Option[String], maxResults: Option[Int]) = Action.async{
        (category, like, dislike) match {
            case (Some(c), Some(l), None) => Future.successful(Ok("Hooray found category " + c + " and some like " + l))
            case (Some(c), None, None) => Future.successful(Ok(articlesToJson(ShopClient.listByCategory(c))))
            case (None, Some(l), None) => Future.successful(Ok(articlesToJson(ShopClient.listByLike(l, gender.get, maxResults))))
            case (None, None, Some(d)) => Future.successful(Ok(Json.toJson(ShopClient.listByDislike(d))))
            case (_, _, _) => Future.successful(Ok("Hooray no parameter"))
        }
    }

    def getBySku(sku: String) = Action{
        Ok(ShopClient.getArticleById(sku))
    }
    
    def getLook(sku: String) = Action.async {
        val articles = ShopTheLook.getLook(sku)
        Future.successful(Ok(articlesToJson(ShopClient.listArticles(articles))))
    }
}
