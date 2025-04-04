NAME := backend

SRCS_DIR = srcs/

GO = go

run: build
	./$(SRCS_DIR)$(NAME)

build: $(NAME)

deps:
	$(GO) -C $(SRCS_DIR) mod tidy
	$(GO) -C $(SRCS_DIR) fmt

$(NAME): $(SRCS)
	$(GO) -C $(SRCS_DIR) build -o $@ .

clean:
	rm -f ./$(SRCS)$(NAME)

re: clean run

.PHONY: all clean re run
