package controllers

import controllers.Application._
import domain.Category
import play.api.libs.json.JsValue
import play.api.mvc.Action
import play.mvc.Controller
import services.ShopClient
import play.api.libs.json.Json

import scala.concurrent.Future

object CategoryController extends Controller{
  
  def buildCategoryTree(categories: List[Category]):Category = {
    val parentNode : Category = (for {
      category <- categories; if !category.parentKey.isDefined
    } yield category).head

    def getAllChildren(parentKey:String) : List[Category] = {
      def children = for {
        c <- categories; if c.parentKey.getOrElse("") == parentKey
      } yield c

      children.map(child => {
        child.children = getAllChildren(child.key).sortWith(_.key < _.key)
        child
      })
    }
    
    parentNode.children = getAllChildren(parentNode.key).sortWith(_.key < _.key)
    parentNode
  }
  
  def getAll = Action{
    Ok(buildCategoryTree(ShopClient.listCategories()).toJson)
  }
  
  def getCategoriesToDepth(depth: Int): List[Category] = {
    val categoryTree = buildCategoryTree(ShopClient.listCategories())
    
    def getChildrenRecursive(depth: Int, children: List[Category]): List[Category] =
      if (depth > 0){
        children.map(x => getChildrenRecursive(depth -1, x.children)).flatten 
      } else {
        children.map(_.children).flatten
      }
    
    getChildrenRecursive(depth, List(categoryTree))
    
  }
}
