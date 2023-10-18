# Maven
FROM maven AS maven_build
COPY . .
RUN mvn clean package -DskipTests

# Eclipse Temurin
FROM eclipse-temurin
COPY --from=maven_build /target/autumn_chat-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080

ENTRYPOINT ["java","-jar","app.jar"]