package services

import play.api.Logger

/**
 * @author iweinzierl
 */
object ShopTheLook {

  var lookToArticle = Map[String, List[String]]()
  var articlesToLook = Map[String, String]()

  def addLook(look: String, articleSkus: List[String]) = {
    val totalArticles = articleSkus :+ look
    lookToArticle += look -> totalArticles

    articleSkus.foreach(x => articlesToLook += x -> look)
    articlesToLook += look -> look
  }

  def getLook(sku: String): List[String] = {
    lookToArticle.get(sku).get
  }

  def getLookForContainedArticle(sku: String): Option[String] = {
    articlesToLook.get(sku)
  }

  def printDebug() = {
    Logger.debug("Looks = " + lookToArticle.size)
    Logger.debug("Articles = " + articlesToLook.size)
  }
}
