import se.woodenstake.SbtGulpTask
import com.typesafe.sbt.SbtNativePackager._
import NativePackagerHelper._
import NativePackagerKeys._ // with auto plugins this won't be necessary soon


name := """freshly"""

version := "1.0-SNAPSHOT-2"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.11.1"

libraryDependencies ++= Seq(
  jdbc,
  anorm,
  cache,
  ws
)

SbtGulpTask.gulpSettings

(WebKeys.pipeline in Assets) <<= (WebKeys.pipeline in Assets) dependsOn GulpKeys.gulp

(WebKeys.assets in Assets) <<= (WebKeys.assets in Assets) dependsOn GulpKeys.gulp

// since sbt-gulp-task is an unfinished plugin in version 0.1 uncomment the following line before building dist or stage but keep it commented for "activator clean run"
//mappings in Assets ++= (target.value / "web/public/main/javascripts/" * "*" get) map (x => x -> ("javascripts/" + x.name))

// setting a maintainer which is used for all packaging types</pre>
maintainer:= "bjoern.werthschulte@zalando.de"

// exposing the play ports
dockerExposedPorts in Docker := Seq(9000)

dockerBaseImage := "zalando/openjdk:8u40-b09-4"

dockerRepository in Docker := Some("pierone.stups.zalan.do/hackweek")

play.PlayImport.PlayKeys.playDefaultPort := 9000

