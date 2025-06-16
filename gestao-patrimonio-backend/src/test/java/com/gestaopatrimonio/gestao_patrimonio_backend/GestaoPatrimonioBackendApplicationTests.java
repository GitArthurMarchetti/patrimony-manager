package com.gestaopatrimonio.gestao_patrimonio_backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource; // <--- Importe esta classe!

@SpringBootTest
@TestPropertySource(properties = {
		"application.security.jwt.secret-key=AbCdefGhIjKlMnOpQrStUvWxYz0123456789eaBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789",
		"application.security.jwt.expiration=86400000"
})
class GestaoPatrimonioBackendApplicationTests {

	@Test
	void contextLoads() {
	}

}