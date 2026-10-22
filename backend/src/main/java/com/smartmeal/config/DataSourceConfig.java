package com.smartmeal.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.io.File;
import java.net.InetAddress;

import org.springframework.context.annotation.Profile;

@Configuration
@Profile("!test")
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${spring.datasource.url:}")
    private String dbUrl;

    @Value("${spring.datasource.username:sa}")
    private String dbUsername;

    @Value("${spring.datasource.password:}")
    private String dbPassword;

    @Value("${spring.datasource.driver-class-name:}")
    private String driverClassName;

    @Bean
    @Primary
    public DataSource dataSource() {
        if (dbUrl != null && !dbUrl.isBlank() && !dbUrl.contains(":h2:")) {
            log.info("Inspecting configured database URL: {}", dbUrl);
            try {
                if (dbUrl.startsWith("jdbc:mysql://")) {
                    String clean = dbUrl.substring("jdbc:mysql://".length());
                    int slashIdx = clean.indexOf('/');
                    int qIdx = clean.indexOf('?');
                    int endHost = slashIdx != -1 ? slashIdx : (qIdx != -1 ? qIdx : clean.length());
                    String hostPort = clean.substring(0, endHost);
                    String host = hostPort.contains(":") ? hostPort.substring(0, hostPort.indexOf(':')) : hostPort;

                    log.info("Verifying network resolution for database host: {}", host);
                    // Fast DNS check - throws UnknownHostException if host was deleted or does not resolve
                    InetAddress.getByName(host);
                }

                HikariConfig config = new HikariConfig();
                config.setJdbcUrl(dbUrl);
                config.setUsername(dbUsername);
                config.setPassword(dbPassword);
                config.setDriverClassName(
                        (driverClassName != null && !driverClassName.isBlank())
                                ? driverClassName
                                : "com.mysql.cj.jdbc.Driver"
                );
                // Fail fast (5 seconds) so the app does not hang forever if external database is unresponsive
                config.setInitializationFailTimeout(5000);
                config.setConnectionTimeout(5000);
                config.setMaximumPoolSize(10);
                config.setMinimumIdle(2);

                HikariDataSource ds = new HikariDataSource(config);
                // Trigger connection validation
                ds.getConnection().close();
                log.info("Successfully connected to primary external MySQL database.");
                return ds;
            } catch (Throwable t) {
                log.warn("External database is unreachable or expired ({}). Seamlessly falling back to embedded H2 database to ensure continuous service availability.", t.getMessage());
            }
        }

        return createFallbackH2DataSource();
    }

    private DataSource createFallbackH2DataSource() {
        try {
            File dataDir = new File("./smartmeal_data");
            if (!dataDir.exists()) {
                dataDir.mkdirs();
            }
        } catch (Exception ignored) {
        }

        log.info("Initializing high-availability embedded H2 database (MySQL compatibility mode).");
        HikariConfig h2Config = new HikariConfig();
        h2Config.setJdbcUrl("jdbc:h2:file:./smartmeal_data/smartmeal;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH;DB_CLOSE_DELAY=-1;NON_KEYWORDS=YEAR");
        h2Config.setDriverClassName("org.h2.Driver");
        h2Config.setUsername("sa");
        h2Config.setPassword("");
        h2Config.setMaximumPoolSize(10);
        h2Config.setMinimumIdle(2);
        return new HikariDataSource(h2Config);
    }
}
