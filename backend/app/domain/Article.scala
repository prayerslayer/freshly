package domain

import play.api.libs.json.Json

case class Article (sku: String, name: String, brand: String, brandLogo: String, price: String, imageUrls: List[String], genders: List[String], attributes: List[String], shopUrl: String) {

  var lookSku: Option[String] = None
  var lookImage: Option[String] = None
  var lookGender: Option[String] = None

  def toJson = {
    Json.toJson(
    Map(
      "sku" -> Json.toJson(sku),
      "name" -> Json.toJson(name),
      "brand" -> Json.toJson(brand),
      "brandLogo" -> Json.toJson(brandLogo),
      "price" -> Json.toJson(price),
      "imageUrls" -> Json.toJson(imageUrls.map(x => Json.toJson(x))),
      "genders" -> Json.toJson(genders.map(x => Json.toJson(x))),
      "attributes" -> Json.toJson(attributes.map(x => Json.toJson(x))),
      "lookSku" -> Json.toJson(lookSku.orNull),
      "lookImage" -> Json.toJson(lookImage.orNull),
      "lookGender" -> Json.toJson(lookGender.orNull),
      "shopUrl" -> Json.toJson(shopUrl)
    )
  )
  }
}
