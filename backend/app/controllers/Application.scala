package controllers

import play.api.mvc._
import services.ShopClient

object Application extends Controller {

  def index = Action {
    Ok(views.html.category(CategoryController.buildCategoryTree(ShopClient.listCategories())))
  }

  def catalog = Action { request =>
    val categoryKey = request.getQueryString("category").get
    val category = ShopClient.getCategoryById(categoryKey)
    Ok(views.html.catalog(category))
  }
}
