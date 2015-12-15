package configuration

import controllers.CategoryController
import play.api.libs.json.{JsValue, Json}
import play.api.{Application, GlobalSettings}
import play.{Logger, Play}
import services.{ShopClient, ShopTheLook}

import scala.io.Source

/**
 * @author iweinzierl
 */
object Global extends GlobalSettings {

  override def onStart(app: Application): Unit = {
    Logger.debug("Initialize global settings")
    initializeShopTheLook()
    preCache()
  }

  def initializeShopTheLook() = {
    Logger.info("Initialize shop the look")
    val resource = Play.application().classloader().getResource("shop-the-look.json")
    val source = Source.fromURL(resource).mkString
    val jsValue = Json.parse(source)

    val looks = (jsValue \ "looks").as[List[JsValue]]
    looks.foreach(x => processLook(x))

    ShopTheLook.printDebug()
  }
  
  def preCache() = {
    Logger.info("Getting data for pre-caching")
    val categories = CategoryController.getCategoriesToDepth(1)
    categories.foreach(x => {
      Logger.debug("caching data for " + x.name)
      ShopClient.listByCategory(x.name)
    })
  }

  def processLook(look: JsValue) = {
    ShopTheLook.addLook((look \ "sku").as[String], (look \ "lookSkus").as[List[String]])
  }
}
