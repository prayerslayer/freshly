package services

import domain.{Category, Article}
import play.api.Logger
import play.api.Play.current
import play.api.cache.Cache
import play.api.libs.json.{JsArray, JsResultException, JsValue}
import play.api.libs.ws._

import scala.collection.mutable
import scala.concurrent.Await
import scala.concurrent.duration._

object ShopClient {

  val SHOP_API_ENDPOINT = "https://api.zalando.com"

  def getArticleById(sku: String): JsValue = {
    val holder: WSRequestHolder = WS.url(SHOP_API_ENDPOINT + "/articles/" + sku).withHeaders("Accept-Language" -> "de-DE")
    val articleFuture = holder.get()

    Await.result(articleFuture, 5.seconds).json
  }

  def listArticleById(sku: String): Option[Article] = {
    val cachedArticle = Cache.getOrElse[Option[Article]]("article-" + sku){
      articleFromJson(getArticleById(sku))
    }
    cachedArticle
  }

  def listArticles(): String = {
    val holder: WSRequestHolder = WS.url(SHOP_API_ENDPOINT + "/articles").withQueryString("pageSize" -> "100").withHeaders("Accept-Language" -> "de-DE")
    val articleFuture = holder.get()

    Await.result(articleFuture, 5.seconds).body
  }

  def listArticles(skus: List[String]): List[Article] = {
    // not cached at the moment
    skus.par.map { sku => {
      try {
        listArticleById(sku)
      }
      catch {
        case e: IllegalArgumentException => {
          Logger.warn("Article not found", e)
        }

        None
      }
    } }.toList.flatten
  }

  def listByCategory(category: String): List[Article] = {
    val holder: WSRequestHolder = WS.url(SHOP_API_ENDPOINT + "/articles").withQueryString("category" -> category).withQueryString("pageSize" -> "100")
      .withHeaders("Accept-Language" -> "de-DE")
    val articleFuture = holder.get()
    val cachedArticles = Cache.getOrElse[List[Article]]("articles-" + category) {
      articlesFromJson(Await.result(articleFuture, 5.seconds).json)
    }
    cachedArticles
  }

  def getCategoryById(id: String): Category = {
    val cachedCategory = Cache.getOrElse[Category]("category-" + id) {
      val holder: WSRequestHolder = WS.url(SHOP_API_ENDPOINT + "/categories/" + id).withHeaders("Accept-Language" -> "de-DE")
      val categoryFuture = holder.get()

      val category = categoryFromJson(Await.result(categoryFuture, 5.seconds).json)

      Cache.set("category-" + id, category)
      category.get
    }

    cachedCategory
  }

  def listCategories(): List[Category] = {
    val holder: WSRequestHolder = WS.url(SHOP_API_ENDPOINT + "/categories").withQueryString("pageSize" -> "5000").withHeaders("Accept-Language" -> "de-DE")
    val categoryFuture = holder.get()

    val cachedCategories = Cache.getOrElse[List[Category]]("main-categories"){
      categoriesFromJson(Await.result(categoryFuture, 5.seconds).json)
    }

    cachedCategories
  }

  def listByLike(articleId: String, gender: String, maxResults: Option[Int]): List[Article] = {
    val startTime = System.currentTimeMillis()

    // there are differences in gender values for categories and articles
    val correctedGender = gender.toUpperCase match {
      case "MEN" => "MALE"
      case "WOMEN" => "FEMALE"
    }

    val maxRecoResults = maxResults match {
      case Some(count) => count
      case None => 50
    }

    val holder: WSRequestHolder = WS.url(SHOP_API_ENDPOINT + "/recommendations/" + articleId).withQueryString("maxResults" -> maxRecoResults.toString).withHeaders("Accept-Language" -> "de-DE")
    val articleFuture = holder.get()

    val cachedRecoArticles = Cache.getOrElse[List[Article]]("recoarticles-"+articleId){
      val articles = articlesFromReco(Await.result(articleFuture, 10.seconds).json)
      articles.filter(article => article.genders.contains(correctedGender))
    }

    Logger.debug("Getting " + cachedRecoArticles.size + " articles from recommendation took " + (System.currentTimeMillis() - startTime) + " ms")

    cachedRecoArticles
  }

  def skuFromReco(jsonReco: JsValue): List[String] = {
    try {
      jsonReco.as[List[JsValue]].par.map(x => (x \ "id").as[String]).toList
    } catch{
    case jsre: JsResultException => {
      Logger.warn("Reco not found: " + jsonReco.toString(), jsre)
      List()
    }
  }
  }

  def listByDislike(articleId: String): List[String] = {
    val startTime = System.currentTimeMillis()

    val holder: WSRequestHolder = WS.url(SHOP_API_ENDPOINT + "/recommendations/" + articleId).withQueryString("maxResults" -> "200").withHeaders("Accept-Language" -> "de-DE")
    val articleFuture = holder.get()

    val cachedRecoArticles = Cache.getOrElse[List[String]]("recoarticles-dislike-"+articleId){
      skuFromReco(Await.result(articleFuture, 10.seconds).json)
    }

    Logger.debug("Getting " + cachedRecoArticles.size + " articles from recommendation took " + (System.currentTimeMillis() - startTime) + " ms")

    cachedRecoArticles
  }

  def articlesFromReco(jsonReco : JsValue) : List[Article] = {
    jsonReco.as[List[JsValue]].par.map(x => {
      val articleSku = (x \ "id").as[String]
      try {
        listArticleById(articleSku)
      }
      catch {
        case iae: IllegalArgumentException => {
          Logger.warn("Article not found: " + articleSku)
          None
        }
      }}).toList.flatten
  }

  def articlesFromJson(jsonArticleList: JsValue) : List[Article] = {
    try {
      (jsonArticleList \ "content").as[List[JsValue]].par.map(x => addLookToArticle(articleFromJson(x.as[JsValue]))).toList.flatten
    } catch{
      case jsre: JsResultException => {
        Logger.warn("articles not found: " + jsonArticleList.toString(), jsre)
        List()
      }
    }
  }

  def articleFromJson(jsonArticle : JsValue) : Option[Article] = {
   try {
     val article = Article((jsonArticle \ "id").as[String],
       (jsonArticle \ "name").as[String],
       ((jsonArticle \ "brand").as[JsValue] \ "name").as[String],
       ((jsonArticle \ "brand").as[JsValue] \ "logoUrl").as[String],
       (((jsonArticle \ "units")(0).as[JsValue] \ "price").as[JsValue] \ "formatted").as[String],
       ((jsonArticle \ "media").as[JsValue] \ "images").as[List[JsValue]].par.map(x => (x.as[JsValue] \ "mediumHdUrl").as[String]).toList,
       (jsonArticle \ "genders").as[List[String]],
       extractAttributes((jsonArticle \ "attributes").as[JsArray]),
       (jsonArticle \ "shopUrl").as[String])

     Some(article)

   } catch{
      case jsre: JsResultException => {
        Logger.warn("article not found: " + jsonArticle.toString(), jsre)
        None
      }
   }
  }

  def extractAttributes(attributesJson: JsArray): List[String] = {
    var attributes = mutable.MutableList[String]()
    attributesJson.value.foreach(pair => {
      val name = (pair \ "name").as[String]
      val values = (pair \ "values").as[List[String]].mkString(", ")
      attributes += "" + name + ": " + values
    })
    attributes.toList
  }

  def addLookToArticle(article: Option[Article]): Option[Article] = {
    article match {
      case Some(x) => {
        ShopTheLook.getLookForContainedArticle (x.sku) match {
          case Some (y) =>
            try{
              Some(addLookToArticle (x, y))
            }catch{
              case jsre: JsResultException => article
            }
          case None => article
        }
      }
      case _ => article
    }
  }

  def addLookToArticle(article: Article, lookSku: String): Article = {
    Logger.info("Add look " + lookSku + " to article " + article.sku)
    article.lookSku = Some(lookSku)
    article.lookImage = getImageForLook(lookSku)
    article.lookGender = getGenderForLook(lookSku)
    article
  }

  def getImageForLook(lookSku: String): Option[String] = {
    val articleJson = getArticleById(lookSku)
    val images = ((articleJson \ "media").as[JsValue] \ "images").as[List[JsValue]]

    images.find(image => (image \ "type").as[String] == "STYLE") match {
      case Some(img) => Some((img \ "mediumHdUrl").as[String])
      case None => None
    }
  }

  def getGenderForLook(lookSku: String): Option[String] = {
    val articleSkus = ShopTheLook.getLook(lookSku)
    val articles = listArticles(articleSkus)

    determineGenderOfArticles(articles)
  }

  def determineGenderOfArticles(articles: List[Article]): Option[String] = {
    val men = articles.filter(article => article.genders.contains("MALE"))
    val women = articles.filter(article => article.genders.contains("FEMALE"))

    if (men.size > women.size) {
      Some("MEN")
    }
    else if (men.size < women.size) {
      Some("WOMEN")
    }
    else {
      Logger.warn("Number of men and women articles are equal for: men = " + men.size + " | women = " + women.size)
      Some("UNI")
    }
  }

  def categoriesFromJson(jsonCategoryList: JsValue) : List[Category] = {
    try{
      (jsonCategoryList \ "content").as[List[JsValue]].par.map(x => categoryFromJson(x.as[JsValue])).toList.flatten
    } catch{
      case jsre: JsResultException => {
        Logger.warn("categories not found: " + jsonCategoryList.toString(), jsre)
        List()
      }
    }
  }

  def categoryFromJson(jsonCategory: JsValue) : Option[Category] = {
    val hidden = (jsonCategory \ "hidden").as[Boolean]
    if(hidden) {
      None
    } else {
      Some(Category(
        (jsonCategory \ "name").as[String],
        (jsonCategory \ "key").as[String],
        (jsonCategory \ "targetGroup").as[String],
        (jsonCategory \ "parentKey").asOpt[String],
        (jsonCategory \ "childKeys").asOpt[List[String]]))
    }
  }
}
