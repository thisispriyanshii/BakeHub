package com.bakehub.my;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.List;
import java.util.Map;

@SpringBootTest
class MyApplicationTests {

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Test
	void inspectDatabase() {
		System.out.println("=== INSPECTING DATABASE ===");
		try {
			List<Map<String, Object>> columns = jdbcTemplate.queryForList("SHOW COLUMNS FROM order_items LIKE 'customization_details'");
			for (Map<String, Object> col : columns) {
				System.out.println("Column details: " + col);
			}

			List<Map<String, Object>> rows = jdbcTemplate.queryForList("SELECT * FROM order_items LIMIT 5");
			System.out.println("Recent order_items rows count: " + rows.size());
			for (Map<String, Object> row : rows) {
				System.out.println("Row: " + row);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		System.out.println("===========================");
	}

}
