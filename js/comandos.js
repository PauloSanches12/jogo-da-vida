// código "strict"
"use strict";
      var tamanhoCelula = 20;  
      var corCelulaViva = "red";  
      var corCelulaMorta = "green";  
      var corBorda = "white";  
  
      var fileirasTabuleiro = 35;
      var colunasTabuleiro = 23;

      var animando = false;
      var lacoAtivo;
      
      var fps = 10;
      var intervalo = 1000 / fps;
      
      var canvas = document.getElementById("canvas");
      var context = canvas.getContext("2d");  

      canvas.width = 800;  
      canvas.height = 440;  
      
      context.lineWidth = 1; 
      context.strokeStyle = corBorda;
      
      function Celula(fileira, coluna) {

        this.fileira = fileira;
        this.coluna = coluna;
        
        this.viva = false;  
        this.vivaNaProximaGeracao = false;
      }

      Celula.prototype.desenhe = function() {
        
        var cantoX = tamanhoCelula * this.coluna;  
        var cantoY = tamanhoCelula * this.fileira;
        var corCelula;
        if (this.viva) {
          corCelula = corCelulaViva;
        } else {
          corCelula = corCelulaMorta;
        }

        context.fillStyle = corCelula;
        context.fillRect(cantoX, cantoY, tamanhoCelula, tamanhoCelula);
        
        
        context.strokeRect(cantoX, cantoY, tamanhoCelula, tamanhoCelula);
      };
      function Tabuleiro(fileiras, colunas) {
        this.fileiras = fileiras;
        this.colunas = colunas;

        this.celulas = [];
        for (var fileira = 0; fileira < this.fileiras; fileira++) {
          this.celulas[fileira] = [];  
          for (var coluna = 0; coluna < this.colunas; coluna++) {
            this.celulas[fileira][coluna] = new Celula(fileira, coluna);
          }
        }
        this.desenhe();
      }
      Tabuleiro.prototype.desenhe = function() {
        for (var fileira = 0; fileira < this.fileiras; fileira++) {
          for (var coluna = 0; coluna < this.colunas; coluna++) {
            this.celulas[fileira][coluna].desenhe();
          }
        }
      };
      
      
      var tabuleiro = new Tabuleiro(fileirasTabuleiro, colunasTabuleiro);
      
      canvas.addEventListener('click', function(event) {

        var boundingRect = this.getBoundingClientRect();

        var x = event.clientX - boundingRect.left;
        var y = event.clientY - boundingRect.top;
        
        var fileira = Math.floor(y / tamanhoCelula);
        var coluna = Math.floor(x / tamanhoCelula);
        if (fileira < tabuleiro.fileiras && coluna < tabuleiro.colunas) {

          tabuleiro.celulas[fileira][coluna].viva = !tabuleiro.celulas[fileira][coluna].viva;
          tabuleiro.celulas[fileira][coluna].desenhe();
        }
      });
      
      Tabuleiro.prototype.contarVizinhasVivas = function(fileira, coluna) {
        var vizinhasVivas = 0;
        for (var f = fileira - 1; f <= fileira + 1; f++) {
          for (var c = coluna - 1; c <= coluna + 1; c++) {
            

            if (!(f == fileira && c == coluna)) {
              

              if (f >= 0 && f < this.fileiras && c >= 0 && c < this.colunas) {
                if (this.celulas[f][c].viva) {
                  vizinhasVivas++;
                }
              }
            }
          }
        }
        return vizinhasVivas;
      };
      // determinar oque acontece com uma célula na proxima geração.
      Tabuleiro.prototype.celulaProximaGeracao = function(fileira, coluna) {
        var vizinhasVivas = this.contarVizinhasVivas(fileira, coluna);
        var celula = this.celulas[fileira][coluna];
        var vivaNaProximaGeracao;
        
        //representação de uma célula viva.
        if (this.celulas[fileira][coluna].viva) {
          
          if (vizinhasVivas == 3) {
            vivaNaProximaGeracao = true;
          } else {
            vivaNaProximaGeracao = false;
          }
        } else {
          //  Uma celula morta com exatamente 2 vizinhas vivas, nascerá na próxima geração.
          if (vizinhasVivas == 2) {
            vivaNaProximaGeracao = true;
          } else {
            vivaNaProximaGeracao = false;
          }
        }
        celula.vivaNaProximaGeracao = vivaNaProximaGeracao;
        return vivaNaProximaGeracao;
      };
      Tabuleiro.prototype.tabuleiroProximaGeracao = function() {
        var f;
        var c;
        
        for (f = 0; f < this.fileiras; f++) {
          for (c = 0; c < this.colunas; c++) {
            this.celulaProximaGeracao(f, c);
          }
        }
        
        for (f = 0; f < this.fileiras; f++) {
          for (c = 0; c < this.colunas; c++) {
            this.celulas[f][c].viva = this.celulas[f][c].vivaNaProximaGeracao;
          }
        }
        this.desenhe();
      };
      Tabuleiro.prototype.limpeTabuleiro = function() {
        for (var f = 0; f < this.fileiras; f++) {
          for (var c = 0; c < this.colunas; c++) {
            this.celulas[f][c].viva = false;
          }
        }
        this.desenhe();
      };

      function lacoDeAnimacao() {
        
        setTimeout(function() {
          if (animando) {
            lacoAtivo = requestAnimationFrame(lacoDeAnimacao);
            tabuleiro.tabuleiroProximaGeracao();
          }
        }, intervalo);
      }
      $("#geracao").click(function () {
        tabuleiro.tabuleiroProximaGeracao();
      });
      
      $("#animacao").click(function () {
        animando = true;
        lacoDeAnimacao();
        $(this).attr("disabled", true);
        $("#geracao").attr("disabled", true);
      });
      
      $("#pare").click(function () {
        animando = false;
        $("#animacao").removeAttr("disabled");
        $("#geracao").removeAttr("disabled");
      });
        
      $("#limpe").click(function () {
        $("#pare").click();  
        tabuleiro.limpeTabuleiro();
      });
             

      
      
      
      Tabuleiro.prototype.darVida = function(fileira, coluna) {
        this.celulas[fileira][coluna].viva = true;
      };
      Tabuleiro.prototype.criarCriatura = function(coordinates) {
        coordinates.forEach(function (point) {
          this.darVida.apply(this, point);
        }, this);
      };
      tabuleiro.criarCriatura(gliderGun);
      tabuleiro.desenhe();
      $("#animacao").click();
