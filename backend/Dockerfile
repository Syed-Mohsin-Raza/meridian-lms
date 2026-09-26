# ---- Stage 1: Build ----
FROM eclipse-temurin:25-jdk-alpine AS build

WORKDIR /workspace

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN chmod +x mvnw

RUN ./mvnw -B -q dependency:go-offline

COPY src src

RUN ./mvnw -B -q clean package -DskipTests

# ---- Stage 2: Runtime ----
FROM eclipse-temurin:25-jre-alpine

RUN addgroup -S spring && adduser -S spring -G spring

WORKDIR /app

COPY --from=build /workspace/target/*.jar app.jar

RUN chown -R spring:spring /app

USER spring

EXPOSE 4000

ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]